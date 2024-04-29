import { Role } from "discord.js";
import { pathToFileURL } from "node:url";
import ExtendedClient from "./Client.js";

export async function getRole(
  name: string,
  serverID: string,
  client: ExtendedClient
): Promise<Role | null> {
  const guild = client.guilds.cache.get(serverID);
  if (!guild) throw `No guild found with id ${serverID}`;

  return (await guild.roles.fetch()).find((role) => role.name === name) || null;
}

export function capitalizeFirstLetter(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}

export async function dynamicImport(path: string) {
  return import(pathToFileURL(path).toString())
    .then((m) => m.default)
    .catch((e) => {
      console.log(path);
      console.log(pathToFileURL(path));
      console.log(pathToFileURL(path).toString());
      throw Error(e);
    });
}
