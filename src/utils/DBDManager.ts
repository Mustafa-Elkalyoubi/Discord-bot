import axios from "axios";

import DbdCharacter, { IDbdCharacter } from "../models/DbdCharacter";
import DbdPerk, { IDbdPerk } from "../models/DbdPerk";
import type { DBDCharacter, DBDDLC, DBDPerk, DBDPower, DbdRole } from "../types";
import { Types } from "mongoose";

interface ObjTunables {
  [key: string]: string[];
}

interface DBDCharApiData {
  [k: string]: Omit<DBDCharacter, "charid">;
}

interface DBDDLCApiData {
  [k: string]: Omit<DBDDLC, "id">;
}

interface DBDPowerApiData {
  [k: string]: Omit<DBDPower, "id">;
}

interface PerkData extends DBDPerk {
  categories: string[] | null;
  tunables: string[][] | ObjTunables;
  modifier: string;
  teachable: number;
}

interface DBDPerkApiData {
  [k: string]: PerkData;
}

type TPerkObject = IDbdPerk & {
  _id: Types.ObjectId;
} & Required<{
    _id: Types.ObjectId;
  }>;

type TCharacterObject = IDbdCharacter & {
  _id: Types.ObjectId;
} & Required<{
    _id: Types.ObjectId;
  }>;
const dbdApiUrl = "https://dbd.tricky.lol/api/";

export default class DBDManager {
  #sanitizeHTML = (str: string) =>
    str
      .replace(/<b>(.*?)<\/b>/g, "**$1**")
      .replace(/<br>/g, "\n")
      .replace(/<i>(.*?)<\/i>/g, "*$1*")
      .replace(/<li>(.*?)<\/li>/g, "• $1\n")
      .replace(/&nbsp;/g, " ");

  async updateDB() {
    const perkDataRes = axios.get<DBDPerkApiData>(dbdApiUrl + "perks", {
      headers: {
        "User-Agent": "Discord Bot - birbkiwi",
      },
    });

    const dlcDataRes = axios.get<DBDDLCApiData>(dbdApiUrl + "dlc", {
      headers: {
        "User-Agent": "Discord Bot - birbkiwi",
      },
    });

    const powerDataRes = axios.get<DBDPowerApiData>(dbdApiUrl + "items", {
      headers: {
        "User-Agent": "Discord Bot - birbkiwi",
      },
      params: {
        role: "killer",
        type: "power",
      },
    });

    const charDataRes = axios.get<DBDCharApiData>(dbdApiUrl + "characters", {
      headers: {
        "User-Agent": "Discord Bot - birbkiwi",
      },
    });

    const responses = await Promise.all([charDataRes, dlcDataRes, powerDataRes, perkDataRes]);

    if (responses.some((r) => r.status !== 200)) {
      console.error(`Failed to updated dbd data`, responses);
      return false;
    }
    const [charData, dlcData, powerData, perkData] = responses;

    const dbdDlc = Object.entries(dlcData.data).map(([key, dlc]) => ({
      id: key,
      name: dlc.name,
      steamid: dlc.steamid,
      time: dlc.time,
    }));

    const dbdPower = Object.entries(powerData.data).map(([key, power]) => ({
      id: key,
      name: this.#sanitizeHTML(power.name),
      description: this.#sanitizeHTML(power.description),
      image: power.image,
    }));

    const dbdPerks = Object.entries(perkData.data).map(([perkID, perk]) => {
      let tunables: ObjTunables = {};
      if (Array.isArray(perk.tunables)) {
        for (let i = 0; i < perk.tunables.length; i++) {
          tunables[i] = [perk.tunables[i][perk.tunables[i].length - 1]];
        }
      } else tunables = perk.tunables;

      for (const key in perk.tunables) {
        perk.description = perk.description.replace(
          new RegExp("\\{" + key + "\\}", "gi"),
          `<b>${tunables[key][tunables[key].length - 1]}</b>`
        );
      }

      return {
        id: perkID,
        name: perk.name,
        character: perk.character,
        description: this.#sanitizeHTML(perk.description),
        image: perk.image,
        role: perk.role,
      };
    });

    const savePerkRes = await DbdPerk.bulkWrite(
      dbdPerks.map((p) => ({
        updateOne: {
          filter: { id: p.id },
          upsert: true,
          update: p,
        },
      }))
    );
    if (!savePerkRes.ok) {
      console.error(savePerkRes);
      return false;
    }

    const perks = await DbdPerk.find();

    if (!perks) {
      console.error(perks);
      return false;
    }

    const dbdChars = Object.entries(charData.data).map(([key, char]) => ({
      updateOne: {
        filter: { id: char.id },
        upsert: true,
        update: {
          charid: parseInt(key),
          name: char.name,
          role: char.role,
          id: char.id,
          gender: char.gender,
          image: char.image,
          dlc: dbdDlc.find((dlc) => dlc.id === char.dlc) || null,
          item: dbdPower.find((power) => power.id === char.item) || null,
          perks: char.perks.map((id) => perks.find((p) => p.id === id) || null),
        },
      },
    }));

    const saveCharRes = await DbdCharacter.bulkWrite(dbdChars);

    if (!saveCharRes.ok) {
      console.error(saveCharRes);
      return false;
    }

    return true;
  }

  async findCharacterByName(name: string): Promise<TCharacterObject | null>;
  async findCharacterByName(
    name: string,
    limit: number,
    role?: DbdRole
  ): Promise<TCharacterObject[]>;
  async findCharacterByName(name: string, limit?: number, role?: DbdRole) {
    try {
      if (typeof limit === "number")
        return (
          await DbdCharacter.find({
            name: { $regex: name, $options: "i" },
            role,
          })
            .sort({ name: "asc" })
            .limit(limit)
        ).map((p) => p.toObject());
      else
        return (
          (
            await DbdCharacter.findOne({
              name: { $regex: name, $options: "i" },
              role,
            })
          )?.toObject() ?? null
        );
    } catch (e) {
      if (e) console.error(e);
      return typeof limit === "number" ? [] : null;
    }
  }

  async findCharacterByCharid(charid: number): Promise<TCharacterObject | null>;
  async findCharacterByCharid(charid: number, limit: number): Promise<TCharacterObject[]>;
  async findCharacterByCharid(charid: number, limit?: number) {
    try {
      if (typeof limit === "number")
        return (
          await DbdCharacter.find({
            charid,
          })
        ).map((d) => d.toObject());
      else
        return (
          (
            await DbdCharacter.findOne({
              charid,
            })
          )?.toObject() ?? null
        );
    } catch (e) {
      if (e) console.error(e);
      return typeof limit === "number" ? [] : null;
    }
  }

  async findPerkByName(name: string): Promise<TPerkObject>;
  async findPerkByName(name: string, limit: number): Promise<TPerkObject[]>;
  async findPerkByName(name: string, limit?: number) {
    try {
      if (typeof limit === "number") {
        return (
          await DbdPerk.find({
            name: { $regex: name, $options: "i" },
          })
            .sort({ name: "asc" })
            .limit(limit)
        ).map((p) => p.toObject());
      } else {
        return (
          (
            await DbdPerk.findOne({
              name: { $regex: name, $options: "i" },
            })
          )?.toObject() ?? null
        );
      }
    } catch (e) {
      if (e) console.error(e);
      return typeof limit === "number" ? [] : null;
    }
  }

  async findPerkById(id: string): Promise<TPerkObject>;
  async findPerkById(id: string[]): Promise<TPerkObject[]>;
  async findPerkById(id: string | string[]) {
    try {
      if (id instanceof Array)
        return (await DbdPerk.find({ id: { $in: id } })).map((p) => p.toObject());
      else return (await DbdPerk.findOne({ id }))?.toObject() ?? null;
    } catch (e) {
      if (e) console.error(e);
      return id instanceof Array ? [] : null;
    }
  }
}
