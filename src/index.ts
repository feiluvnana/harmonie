import { Client, Collection, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Command } from "./commands/types";
import { Event } from "./events/types";

async function bootstrap() {
  try {
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
          const command: Command = await import(path.resolve(commandsFolder, file)).then((module) => module.default);
          client.commands.set(command.builder.name, command);
          console.log(`Loaded command: ${command.builder.name}`);
        }
      })
    );

    client.events = new Collection<string, Event>();
    const eventsFolder = path.resolve(__dirname, "events");
    await Promise.all(
      fs.readdirSync(eventsFolder).map(async (file) => {
        if (file.endsWith(".ts") && file !== "types.d.ts") {
          const event: Event = await import(path.resolve(eventsFolder, file)).then((module) => module.default);
          client.events.set(event.name.toString(), event);
          if (event.once) {
            client.once(event.name.toString(), (...args) => event.execute(client, ...args));
          } else {
            client.on(event.name.toString(), (...args) => event.execute(client, ...args));
          }
          console.log(`Loaded event: ${event.name}`);
        }
      })
    );

    await client.login(process.env.DISCORD_TOKEN);
    console.log("Bot is ready!");
  } catch (error) {
    console.log("Error starting bot:", error);
  }
}

dotenv.config();
bootstrap();
