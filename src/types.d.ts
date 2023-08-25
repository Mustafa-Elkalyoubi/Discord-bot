import {
  Message,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  MessageContextMenuCommandInteraction,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
} from "discord.js";
import { BaseCommand } from "./utils/BaseCommand";
import BaseSlashSubCommand from "./utils/BaseSlashSubCommand";
import ExtendedClient from "./utils/Client";

type messageProps = {
  run(message: Message, args: string[], client?: ExtendedClient): void;
  conf: {
    aliases: Array<string>;
    permLevel: number;
  };
  help: {
    name: string;
    description: string;
    usage: string;
  };
};

export type reminderDetails = {
  id: number;
  message: string;
  timeToRemind: number;
  recurring: boolean;
  channel: string;
  details?: {
    day: string;
    hour: number;
    minute: number;
  };
};

interface Command extends BaseCommand {
  constructor(): void;
  getSlashCommandJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
  run(interaction: ChatInputCommandInteraction, client?: ExtendedClient): void;
  autocomplete?(interaction: AutocompleteInteraction, client?: ExtendedClient): void;
}

export declare interface BaseSubCommand extends BaseSlashSubCommand {
  constructor(): void;
  getSlashCommandJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
}

export interface SubCommand {
  constructor(): void;
  run(interaction: ChatInputCommandInteraction, client?: ExtendedClient): void;
  autocomplete?(interaction: AutocompleteInteraction, client?: ExtendedClient): void;
}

export declare interface ContextCommand {
  constructor: void;
  getContextCommandJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
  run(interaction: MessageContextMenuCommandInteraction, client?: ExtendedClient): void;
}

type UserFineData = {
  username: string;
  fineAmount: number;
  fineCap: number;
  capReached: boolean;
};

export interface FineData {
  lastMessageID: string;
  userFineData: {
    [userid: string]: UserFineData;
  };
}
