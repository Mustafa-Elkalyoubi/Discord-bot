import type {
  Message,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  MessageContextMenuCommandInteraction,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  Snowflake,
} from "discord.js";
import type { BaseCommand } from "./utils/BaseCommand";
import type BaseSlashSubCommand from "./utils/BaseSlashSubCommand";
import type ExtendedClient from "./utils/Client";
import { Types } from "mongoose";

type messageCommandProps = {
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

interface BaseReminder {
  _id: Types.ObjectId;
  message: string;
  channel: Snowflake;
  recurring: boolean;
}

interface RecurringReminder extends BaseReminder {
  recurring: true;
  details: {
    day: number;
    hour: number;
    minute: number;
  };
}

interface RegularReminder extends BaseReminder {
  timeToRemind: Date;
  recurring: false;
}

export type ReminderDetails = RegularReminder | RecurringReminder;
export type ReminderSaveType = Array<[Snowflake, Array<ReminderDetails>]>;

interface Command extends BaseCommand {
  getSlashCommandJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
  run(interaction: ChatInputCommandInteraction, client?: ExtendedClient): Promise<void>;
  autocomplete?(interaction: AutocompleteInteraction, client?: ExtendedClient): Promise<void>;
}

export declare interface BaseSubCommand extends BaseSlashSubCommand {
  getSlashCommandJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
}

export interface SubCommand {
  server: Snowflake;
  run(interaction: ChatInputCommandInteraction, client?: ExtendedClient): Promise<void>;
  autocomplete?(interaction: AutocompleteInteraction, client?: ExtendedClient): Promise<void>;
}

export declare interface ContextCommand {
  all: boolean;
  constructor: void;
  getContextCommandJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
  run(interaction: MessageContextMenuCommandInteraction, client?: ExtendedClient): Promise<void>;
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

export type DbdRole = "killer" | "survivor";

export interface DBDPerk {
  id: string;
  name: string;
  description: string;
  role: DbdRole;
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
  gender: "male" | "female" | "nothuman" | "multiple";
  dlc: string | null;
  image: string;
  perks: [string, string, string];
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
