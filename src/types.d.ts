import {
  Message,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  MessageContextMenuCommandInteraction,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  Snowflake,
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
  getSlashCommandJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
  run(interaction: ChatInputCommandInteraction, client?: ExtendedClient): void;
  autocomplete?(interaction: AutocompleteInteraction, client?: ExtendedClient): void;
}

export declare interface BaseSubCommand extends BaseSlashSubCommand {
  getSlashCommandJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
}

export interface SubCommand {
  server: Snowflake;
  run(interaction: ChatInputCommandInteraction, client?: ExtendedClient): void;
  autocomplete?(interaction: AutocompleteInteraction, client?: ExtendedClient): void;
}

export declare interface ContextCommand {
  all: boolean;
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

export interface DBDPerk {
  id: string;
  name: string;
  description: string;
  role: "killer" | "survivor";
  character: number | null;
  image: string;
}

export interface DBDPower {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface DBDChar {
  id: string;
  charid: string;
  name: string;
  gender: "male" | "female" | "nothuman";
  dlc: string | null;
  image: string;
}

export interface dbdSurvivor extends DBDChar {
  role: "survivor";
  item: null;
}

export interface dbdKiller extends DBDChar {
  role: "killer";
  item: string;
}

export type DBDCharacter = dbdSurvivor | dbdKiller;

export interface DBDDLC {
  id: string;
  name: string;
  steamid: number;
  time: number;
}

export type OSRSWikiData = Array<{
  examine: string;
  id: number;
  members: boolean;
  lowalch: number;
  limit: number;
  value: number;
  highalch: number;
  icon: string;
  name: string;
}>;
