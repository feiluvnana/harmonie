import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { PollStatus } from "../core/enums";
import { Poll } from "../entities/poll.entity";
import { PollOption } from "../entities/poll_option.entity";
import { DBService } from "../services/db.service";
import { Command } from "./types";

const command: Command = {
  builder: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create and manage polls")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("create")
        .setDescription("Create a new poll")
        .addStringOption((option) =>
          option.setName("question").setDescription("What would you like to ask?").setRequired(true)
        )
        .addStringOption((option) =>
          option.setName("options").setDescription("Your options (separated by |)").setRequired(true)
        )
        .addBooleanOption((option) =>
          option.setName("anonymous").setDescription("Make it a secret poll?").setRequired(false)
        )
        .addBooleanOption((option) =>
          option.setName("multiple").setDescription("Allow multiple choices?").setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName("duration")
            .setDescription("How long should the poll last? (in hours)")
            .setMinValue(1)
            .setMaxValue(168) // 1 week
            .setRequired(false)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("end")
        .setDescription("End a poll early")
        .addStringOption((option) => option.setName("poll_id").setDescription("Which poll to end?").setRequired(true))
    )
    .addSubcommand(new SlashCommandSubcommandBuilder().setName("list").setDescription("See all active polls"))
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("result")
        .setDescription("Check poll result")
        .addStringOption((option) =>
          option.setName("poll_id").setDescription("Which poll's result to see?").setRequired(true)
        )
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const subcommand = interaction.options.getSubcommand();

    try {
      switch (subcommand) {
        case "create": {
          if (!interaction.guildId) {
            await interaction.reply({
              content: "This command can only be used in a server!",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          const question = interaction.options.getString("question", true);
          const optionsStr = interaction.options.getString("options", true);
          const anonymous = interaction.options.getBoolean("anonymous") ?? true;
          const multiple = interaction.options.getBoolean("multiple") ?? false;
          const duration = interaction.options.getInteger("duration") ?? 1;

          // Validate options
          const options = optionsStr
            .split("|")
            .map((opt) => opt.trim())
            .filter((opt) => opt.length > 0);
          if (options.length < 2) {
            await interaction.reply({
              content: "You need at least 2 options for a poll!",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          await DBService.em.transactional(async (em) => {
            const pollRepo = em.getRepository(Poll);
            const pOptionRepo = em.getRepository(PollOption);

            // Create poll options
            const pollOptions = options.map((opt, index) =>
              pOptionRepo.create({
                option: opt,
                emoji: `${index + 1}️⃣`,
                count: 0,
              })
            );

            // Create poll message first to get messageId
            const message = await interaction.reply({
              content: `**${question}**\n\n${pollOptions
                .map((opt, i) => `${opt.emoji} ${opt.option}`)
                .join("\n")}\n\nVote with the numbers below!`,
              withResponse: true,
            });

            if (!message.resource?.message?.id) {
              await interaction.reply({
                content: "Something went wrong creating your poll!",
                flags: MessageFlags.Ephemeral,
              });
              return;
            }

            // Create and save poll
            const poll = pollRepo.create({
              question,
              userId: interaction.user.id,
              guildId: interaction.guildId!,
              messageId: message.resource.message.id,
              anonymous,
              multiple,
              endsAt: new Date(Date.now() + duration * 60 * 60 * 1000),
              options: pollOptions,
            });

            await em.persistAndFlush(poll);

            // Add reactions
            for (const opt of pollOptions) {
              await message.resource.message.react(opt.emoji);
            }
          });

          break;
        }

        case "end": {
          // Validate poll id
          const pollId = interaction.options.getString("poll_id", true);

          await DBService.em.transactional(async (em) => {
            const pollRepo = em.getRepository(Poll);

            // Find poll by id
            const poll = await pollRepo.findOne({ id: pollId });
            if (!poll) {
              await interaction.reply({
                content: "I couldn't find that poll!",
                flags: MessageFlags.Ephemeral,
              });
              return;
            }

            // Check if user is owner of poll
            if (poll.userId !== interaction.user.id) {
              await interaction.reply({
                content: "You can only end your own polls!",
                flags: MessageFlags.Ephemeral,
              });
              return;
            }

            poll.status = PollStatus.ENDED;
            await em.flush();
            await interaction.reply("Poll ended successfully!");
          });
          break;
        }

        // case "list": {
        //   const polls = await DBService.em.find(Poll, {
        //     guildId: interaction.guildId,
        //     status: PollStatus.ACTIVE,
        //   });

        //   if (polls.length === 0) {
        //     await interaction.reply("No active polls found!");
        //     return;
        //   }

        //   const pollList = polls.map((poll) => `• ${poll.question} (ID: ${poll.id})`).join("\n");

        //   await interaction.reply(`**Active Polls:**\n${pollList}`);
        //   break;
        // }

        // case "results": {
        //   const pollId = interaction.options.getString("poll_id", true);
        //   const poll = await DBService.em.findOne(Poll, { id: pollId });

        //   if (!poll) {
        //     await interaction.reply({
        //       content: "I couldn't find that poll!",
        //       flags: MessageFlags.Ephemeral,
        //     });
        //     return;
        //   }

        //   if (poll.status !== PollStatus.ENDED && poll.userId !== interaction.user.id) {
        //     await interaction.reply({
        //       content: "You can only view results of your own polls or ended polls!",
        //       flags: MessageFlags.Ephemeral,
        //     });
        //     return;
        //   }

        //   const results = poll.options.map((opt) => `${opt.emoji} ${opt.option}: ${opt.count} votes`).join("\n");

        //   await interaction.reply(`**${poll.question}**\n\n**Results:**\n${results}`);
        //   break;
        // }
      }
    } catch (error) {
      console.error("Error in poll command:", error);
      await interaction.reply({
        content: "Something went wrong!",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export default command;
