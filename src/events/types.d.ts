import { Client, Events } from "discord.js";

export interface Event {
  name: Events;
  once: boolean;
  execute: (client: Client, ...args: any[]) => Promise<void>;
}

declare module "discord.js" {
  export interface Client {
    events: Collection<string, Event>;
  }
}
