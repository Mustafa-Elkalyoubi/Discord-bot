import { Role } from "discord.js";
import ExtendedClient from "./Client";

export async function ensureRole(
  name: string,
  serverID: string,
  client: ExtendedClient
): Promise<Role | undefined> {
  const guild = client.guilds.cache.get(serverID);
  if (!guild) throw `No guild found with id ${serverID}`;

  let role: Role | undefined;
  role = guild.roles.cache.find((role) => role.name === name);
  if (role) return role;

  try {
    role = await guild.roles.create({
      name: name,
      color: "Random",
      mentionable: true,
    });

    return role;
  } catch (e) {
    if (e) throw e;
  }
}

export function capitalizeFirstLetter(str: string) {
  return str[0].toUpperCase() + str.slice(1);
}
