import { Role } from "discord.js";
import ExtendedClient from "./Client";
import { pathToFileURL } from "url";

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

export function dynamicImport(path: string) {
  return import(pathToFileURL(path).toString())
    .then((m) => m.default)
    .catch((e) => {
      throw Error(e);
    });
}
