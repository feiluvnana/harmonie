import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
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
            .setMaxValue(168)
            .setRequired(false)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("end")
        .setDescription("End a poll early")
        .addIntegerOption((option) => option.setName("poll_id").setDescription("Which poll to end?").setRequired(true))
    )
    .addSubcommand(new SlashCommandSubcommandBuilder().setName("list").setDescription("See all active polls"))
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("results")
        .setDescription("Check poll results")
        .addIntegerOption((option) =>
          option.setName("poll_id").setDescription("Which poll's results to see?").setRequired(true)
        )
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    console.log(`[Command] ${interaction.commandName} đã được kích hoạt.`);

    switch (interaction.options.getSubcommand()) {
      case "create": {
        await handlePollCreate(interaction);
        break;
      }
    }
  },
};

export default command;

async function handlePollCreate(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  // Kiểm tra xem command được sử dụng trong guild hay không
  if (!interaction.guildId || !interaction.channelId) {
    await interaction.editReply({
      content: "Command này chỉ có thể được sử dụng trong một guild và channel!",
    });
    return;
  }

  // Lấy tham số
  const question = interaction.options.getString("question", true);
  const options = interaction.options
    .getString("options", true)
    .split("|")
    .map((opt) => opt.trim())
    .filter((opt) => opt.length > 0);
  if (options.length < 2) {
    await interaction.editReply({
      content: "Bạn cần ít nhất 2 tùy chọn cho một cuộc bình chọn!",
    });
    return;
  }
  const anonymous = interaction.options.getBoolean("anonymous") ?? true;
  const multiple = interaction.options.getBoolean("multiple") ?? false;
  const duration = interaction.options.getInteger("duration") ?? 1;

  await DBService.em.transactional(async (em) => {
    const pollRepo = em.getRepository(Poll);
    const pOptionRepo = em.getRepository(PollOption);

    // Tạo tùy chọn cuộc bình chọn
    const pollOptions = options.map((opt, index) =>
      pOptionRepo.create({
        option: opt,
        emoji: `${index + 1}️⃣`,
        count: 0,
      })
    );

    // Tạo và lưu cuộc bình chọn
    const poll = pollRepo.create({
      question,
      userId: interaction.user.id,
      guildId: interaction.guildId!,
      channelId: interaction.channelId!,
      anonymous,
      multiple,
      endsAt: new Date(Date.now() + duration * 60 * 60 * 1000),
      options: pollOptions,
    });
    await em.persistAndFlush(poll);

    // Tạo tin nhắn
    const message = await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Poll created by " + interaction.user.tag)
          .setDescription(`**${question}**`)
          .setColor(0x3498db) // Nice blue color
          .setFields(pollOptions.map((opt) => ({ name: `${opt.emoji} ${opt.option}`, value: "", inline: true })))
          .setFooter({
            text: `Poll ID: ${poll.id} • ${multiple ? "Multiple choice allowed" : "Single choice only"}`,
          })
          .setTimestamp(poll.endsAt),
      ],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("poll_vote")
            .setPlaceholder("Select an option.")
            .addOptions(pollOptions.map((opt) => ({ label: `${opt.emoji} ${opt.option}`, value: opt.id.toString() })))
        ),
      ],
    });

    // Cập nhật ID tin nhắn vào cuộc bình chọn
    poll.messageId = message.id;
    await em.persistAndFlush(poll);
  });
}
