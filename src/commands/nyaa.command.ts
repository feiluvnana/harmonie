import { SlashCommandBuilder } from "discord.js";
import { Command } from "./types";

const command: Command = {
  builder: new SlashCommandBuilder().setName("nyaa").setDescription("Replies with Nyaa~!"),
  execute: async (interaction) => {
    await interaction.reply("Nyaa~!");
  },
};

export default command;
