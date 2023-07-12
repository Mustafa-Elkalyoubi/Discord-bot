import path from "path";
import fs from "node:fs";
import fsPromise from "node:fs/promises";
import { Collection } from "discord.js";
import { DEFAULT, GREEN } from "./ConsoleText";
import { DateTime } from "luxon";
import ExtendedClient from "./Client";

const log = (message: string) => {
  console.log(`${GREEN}[${DateTime.now().toFormat("yyyy-MM-DD HH:mm:ss")}]: ${DEFAULT}${message}`);
};

async function registerCommands(client: ExtendedClient, dir = "../commands") {
  // get command folder and files inside
  const filePath = path.join(__dirname, dir);
  const files = await fsPromise.readdir(filePath);

  for (const file of files) {
    // if folder in commands, register all commands inside folder
    const stat = await fsPromise.lstat(path.join(filePath, file));
    if (stat.isDirectory()) {
      log(`Opening folder: ${file}`);
      await registerCommands(client, path.join(dir, file));
      log(`Closing folder: ${file}`);
    }
    // create new command object, and add to client.commands
    if (file.endsWith(".js") || file.endsWith(".ts")) {
      const { default: Command } = require(path.join(filePath, file));
      const cmd = new Command();
      client.commands?.set(cmd.name, cmd);
      log(`${GREEN}Registering command: ${DEFAULT}${cmd.name}`);
    }
  }
}

async function registerSubCommands(client: ExtendedClient, dir = "../subcommands") {
  // get subcommand folder and files inside
  const filePath = path.join(__dirname, dir);
  const files = await fsPromise.readdir(filePath);

  for (const file of files) {
    log(`${GREEN}Registering subcommand: ${DEFAULT}${file}`);
    const folderPath = path.join(filePath, file);
    const stat = await fsPromise.lstat(folderPath);
    if (stat.isDirectory()) {
      const subCommandDirectoryFiles = await fsPromise.readdir(folderPath);
      const indexFilePos = subCommandDirectoryFiles.indexOf(
        `${file}${fs.existsSync(`${file}.js`) ? ".js" : ".ts"}`
      );
      subCommandDirectoryFiles.splice(indexFilePos, 1);
      try {
        var baseFile = path.join(folderPath, file + ".js");
        const { default: BaseSubCommand } = require(fs.existsSync(baseFile)
          ? baseFile
          : path.join(folderPath, file + ".ts"));
        const subCommand = new BaseSubCommand();
        client.subCommands?.set(file, subCommand);

        for (const group of subCommand.groups) {
          for (const command of group.subCommands) {
            const { default: SubCommand } = require(path.join(folderPath, group.name, command));
            let subCommandGroupMap = subCommand.groupCommands.get(group.name);
            if (subCommandGroupMap)
              subCommandGroupMap.set(command, new SubCommand(file, group.name, command));
            else {
              subCommandGroupMap = new Collection();
              subCommandGroupMap.set(command, new SubCommand(file, group.name, command));
            }
            subCommand.groupCommands.set(group.name, subCommandGroupMap);
          }
          const fileIndex = subCommandDirectoryFiles.indexOf(group.name);
          subCommandDirectoryFiles.splice(fileIndex, 1);
        }
        for (const subCommandFile of subCommandDirectoryFiles) {
          if (subCommandFile.endsWith(".json")) continue;
          const { default: SubCommand } = require(path.join(folderPath, subCommandFile));
          const cmd = new SubCommand(file, null, subCommandFile.split(".")[0]);
          const subCommandInstance = client.subCommands?.get(file);
          subCommandInstance?.groupCommands.set(cmd.name, cmd);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
}

async function registerContextCommands(client: ExtendedClient, dir = "../contextCommands") {
  const folderPath = path.join(__dirname, dir);
  const files = await fsPromise.readdir(folderPath);
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stat = await fsPromise.lstat(filePath);
    if (stat.isDirectory()) {
      log(`Opening folder ${file}`);
      await registerContextCommands(client, filePath);
      log(`Closing folder ${file}`);
    }
    if (file.endsWith(".js") || file.endsWith(".ts")) {
      const { default: Command } = require(filePath);
      const cmd = new Command();
      client.contextCommands?.set(cmd.name, cmd);
      log(`${GREEN}Registering context command: ${DEFAULT}${cmd.name}`);
    }
  }
}

export { registerCommands, registerSubCommands, registerContextCommands };
