import type { BaseCommand } from "./utils/BaseCommand.js";
import type BaseSlashSubCommand from "./utils/BaseSlashSubCommand.js";
import type ExtendedClient from "./utils/Client.js";

declare global {
  class Stringified<T> extends String {
    private ___stringified: T;
  }

  interface JSON {
    stringify<T>(
      value: T,
      replacer?: (key: string, value: unknown) => unknown,
      space?: string | number
    ): string & Stringified<T>;
    parse<T>(text: Stringified<T>, reviver?: (key: unknown, value: unknown) => unknown): T;
    parse(text: string, reviver?: (key: unknown, value: unknown) => unknown): unknown;
  }

  interface TypedEventEmitter<Events extends EventMap> {
    addListener<E extends keyof Events>(event: E, listener: Events[E]): this;
    on<E extends keyof Events>(event: E, listener: Events[E]): this;
    once<E extends keyof Events>(event: E, listener: Events[E]): this;
    prependListener<E extends keyof Events>(event: E, listener: Events[E]): this;
    prependOnceListener<E extends keyof Events>(event: E, listener: Events[E]): this;

    off<E extends keyof Events>(event: E, listener: Events[E]): this;
    removeAllListeners<E extends keyof Events>(event?: E): this;
    removeListener<E extends keyof Events>(event: E, listener: Events[E]): this;

    emit<E extends keyof Events>(event: E, ...args: Parameters<Events[E]>): boolean;
    // The sloppy `eventNames()` return type is to mitigate type incompatibilities - see #5
    eventNames(): (keyof Events | string | symbol)[];
    rawListeners<E extends keyof Events>(event: E): Events[E][];
    listeners<E extends keyof Events>(event: E): Events[E][];
    listenerCount<E extends keyof Events>(event: E): number;

    getMaxListeners(): number;
    setMaxListeners(maxListeners: number): this;
  }

  type EventMap = {
    [key: string]: (...args: never[]) => void;
  };

  type messageCommandProps = {
    run(message: import("discord.js").Message, args: string[], client?: ExtendedClient): void;
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
    _id: import("mongoose").Types.ObjectId;
    message: string;
    channel: import("discord.js").Snowflake;
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
  export type ReminderSaveType = Array<[import("discord.js").Snowflake, Array<ReminderDetails>]>;

  interface Command extends BaseCommand {
    getSlashCommandJSON(): import("discord.js").RESTPostAPIChatInputApplicationCommandsJSONBody;
    run(
      interaction: import("discord.js").ChatInputCommandInteraction,
      client?: ExtendedClient
    ): Promise<unknown> | unknown;
    autocomplete?(
      interaction: import("discord.js").AutocompleteInteraction,
      client?: ExtendedClient
    ): Promise<unknown> | unknown;
  }

  export interface BaseSubCommand extends BaseSlashSubCommand {
    getSlashCommandJSON(): import("discord.js").RESTPostAPIChatInputApplicationCommandsJSONBody;
  }

  export interface SubCommand {
    server: import("discord.js").Snowflake;
    run(
      interaction: import("discord.js").ChatInputCommandInteraction,
      client?: ExtendedClient
    ): Promise<void>;
    autocomplete?(
      interaction: import("discord.js").AutocompleteInteraction,
      client?: ExtendedClient
    ): Promise<void>;
  }

  export interface ContextCommand {
    all: boolean;
    constructor: void;
    getContextCommandJSON(): import("discord.js").RESTPostAPIChatInputApplicationCommandsJSONBody;
    run(
      interaction: import("discord.js").MessageContextMenuCommandInteraction,
      client?: ExtendedClient
    ): Promise<void>;
  }

  type UserFineData = {
    username: string;
    fineAmount: number;
    fineCap: number;
    capReached: boolean;
  };

  export interface FineData {
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
}
