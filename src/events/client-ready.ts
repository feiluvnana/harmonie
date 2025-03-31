import { Client, Events } from "discord.js";
import { Event } from "./types";

const event: Event = {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Client) => {
    console.log(`Ready! Logged in as ${client.user?.tag}.`);
  },
};

export default event;
