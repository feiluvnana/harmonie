import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";

const command: Command = {
  builder: new SlashCommandBuilder().setName("nyaa").setDescription("Nyaa~!"),
  execute: async (interaction) => {
    console.log(`[Command] ${interaction.commandName} đã được kích hoạt.`);

    try {
      await interaction.reply("Nyaa~!");
    } catch (error) {
      console.error(`[Command] ${interaction.commandName} đã xảy ra lỗi: ${error}`);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "Đã xảy ra lỗi khi thực hiện command!", ephemeral: true });
      } else {
        await interaction.reply({ content: "Đã xảy ra lỗi khi thực hiện command!", ephemeral: true });
      }
    }
  },
};

export default command;
