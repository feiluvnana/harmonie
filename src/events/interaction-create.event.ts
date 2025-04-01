import { CommandInteraction, Events, MessageFlags } from "discord.js";
import { Event } from "./types";

const event: Event = {
  name: Events.InteractionCreate,
  once: false,
  execute: async (interaction: CommandInteraction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      await interaction.reply({ content: "This command does not exist!", flags: MessageFlags.Ephemeral });
      return;
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      console.log(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
      } else {
        await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
      }
    }
  },
};

export default event;
