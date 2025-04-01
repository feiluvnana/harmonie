import { CommandInteraction, Events, MessageFlags } from "discord.js";
import { Event } from "./types";

const event: Event = {
  name: Events.InteractionCreate,
  once: false,
  execute: async (interaction: CommandInteraction) => {
    console.log(`[Event] ${Events.InteractionCreate} đã được kích hoạt.`);

    if (!interaction.isChatInputCommand()) {
      await interaction.reply({ content: "Command không tồn tại!", flags: MessageFlags.Ephemeral });
      return;
    }

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      await interaction.reply({ content: "Command không tồn tại!", flags: MessageFlags.Ephemeral });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`[Event] ${Events.InteractionCreate} đã xảy ra lỗi: ${error}`);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "Đã xảy ra lỗi khi thực hiện command!", ephemeral: true });
      } else {
        await interaction.reply({ content: "Đã xảy ra lỗi khi thực hiện command!", ephemeral: true });
      }
    }
  },
};

export default event;
