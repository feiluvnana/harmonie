import "reflect-metadata";

import { Client, Collection, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Command } from "./commands/types";
import { Event } from "./events/types";
import { Service } from "./services/types";

async function bootstrap() {
  try {
    console.log("[Index] Đang khởi chạy Harmonie...");
    await Promise.all(
      fs.readdirSync(path.resolve(__dirname, "services")).map(async (file) => {
        if (file.endsWith(".ts") && file !== "types.d.ts") {
          console.log(`[Index] Đang tải service: ${file}`);
          const service: Service = await import(path.resolve(__dirname, "services", file)).then((module) => module);
          await service.initialize();
          console.log(`[Index] Đã tải service: ${file}`);
        }
      })
    );

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });

    client.commands = new Collection<string, Command>();
    const commandsFolder = path.resolve(__dirname, "commands");
    await Promise.all(
      fs.readdirSync(commandsFolder).map(async (file) => {
        if (file.endsWith(".ts") && file !== "types.d.ts") {
          console.log(`[Index] Đang tải command: ${file}`);
          const command: Command = await import(path.resolve(commandsFolder, file)).then((module) => module.default);
          client.commands.set(command.builder.name, command);
          console.log(`[Index] Đã tải command: ${command.builder.name}`);
        }
      })
    );

    client.events = new Collection<string, Event>();
    const eventsFolder = path.resolve(__dirname, "events");
    await Promise.all(
      fs.readdirSync(eventsFolder).map(async (file) => {
        if (file.endsWith(".ts") && file !== "types.d.ts") {
          const event: Event = await import(path.resolve(eventsFolder, file)).then((module) => module.default);
          if (event.name) {
            console.log(`[Index] Đang tải event: ${event.name}`);
            client.events.set(event.name.toString(), event);
            if (event.once) {
              client.once(event.name.toString(), (...args) => event.execute(...args));
            } else {
              client.on(event.name.toString(), (...args) => event.execute(...args));
            }
            console.log(`[Index] Đã tải event: ${event.name}`);
          }
        }
      })
    );

    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error("[Index] Lỗi khởi chạy Harmonie:", error);
  }
}

dotenv.config();
bootstrap();
