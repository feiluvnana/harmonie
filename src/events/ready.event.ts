import { Client, Events } from "discord.js";
import { Event } from "./types";

const event: Event = {
  name: Events.ClientReady,
  once: true,
  execute: async (client: Client) => {
    console.log(`[Event] ${Events.ClientReady} đã được kích hoạt.`);
  },
};

export default event;
