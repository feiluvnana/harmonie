import { Events } from "discord.js";

export interface Event {
  name: Events;
  once: boolean;
  execute: (...args: any[]) => Promise<void>;
}

declare module "discord.js" {
  export interface Client {
    events: Collection<string, Event>;
  }
}
