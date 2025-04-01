import { Client, Events, Interaction } from "discord.js";
import { Event } from "./types";

const event: Event = {
  name: Events.InteractionCreate,
  once: false,
  execute: async (client: Client, interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.log(`No command matching ${interaction.commandName} was found.`);
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
