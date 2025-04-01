import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { Command } from "./types";

const command: Command = {
  builder: new SlashCommandBuilder()
    .setName("poll")
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("create")
        .addStringOption((option) => option.setName("question").setRequired(true))
        .addStringOption((option) => option.setName("options").setRequired(true))
        .addBooleanOption((option) => option.setName("anonymous").setRequired(false))
        .addBooleanOption((option) => option.setName("multiple").setRequired(false))
        .addIntegerOption((option) =>
          option
            .setName("duration")
            .setMinValue(1)
            .setMaxValue(168) // 1 week
            .setRequired(false)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("end")
        .addStringOption((option) => option.setName("poll_id").setRequired(true))
    )
    .addSubcommand(new SlashCommandSubcommandBuilder().setName("list"))
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("results")
        .addStringOption((option) => option.setName("poll_id").setRequired(true))
    ),
  execute: async (interaction) => {
    // Command execution logic will go here
    return;
  },
};

export default command;
