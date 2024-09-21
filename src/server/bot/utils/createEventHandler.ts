import { ClientEvents } from "discord.js";

function createEventHandler<T extends keyof ClientEvents>(
  name: T,
  run: DiscordEventHandler<T>["run"],
  additionalProps?: Omit<DiscordEventHandler<T>, "name" | "run">
): DiscordEventHandler<T> {
  return { name, run, ...additionalProps };
}

export default createEventHandler;
