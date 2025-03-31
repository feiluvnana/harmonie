import { ApplicationCommandDataResolvable, REST, Routes } from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { Command } from "./commands/types";

async function deploy() {
  const commands: Command[] = [];
  const commandsFolder = path.resolve(__dirname, "commands");
  await Promise.all(
    fs.readdirSync(commandsFolder).map(async (file) => {
      if (file.endsWith(".ts") && file !== "index.ts" && file !== "types.ts") {
        const filePath = path.resolve(commandsFolder, file);
        const command = await import(filePath);
        commands.push(command.default);
      }
    })
  );

  try {
    const rest = new REST().setToken(process.env.DISCORD_TOKEN!);
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    const data = (await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: commands.map((command) => command.builder.toJSON()),
    })) as ApplicationCommandDataResolvable[];
    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.log(error);
  }
}

dotenv.config();
deploy();
