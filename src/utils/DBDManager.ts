import path from "path";
import fs from "node:fs";
import axios from "axios";

import type { DBDCharacter, DBDDLC, DBDPerk, DBDPower } from "../types";

const dbdApiUrl = "https://dbd.tricky.lol/api/";

export default class DBDManager {
  public perks: DBDPerk[];
  public characters: DBDCharacter[];
  public DLCs: DBDDLC[];
  public powers: DBDPower[];

  constructor(basePath: string) {
    const perkFilePath = path.join(basePath, "dbdPerks.json");
    const charFilePath = path.join(basePath, "dbdChars.json");
    const dlcFilePath = path.join(basePath, "dbdDLC.json");
    const powerFilePath = path.join(basePath, "dbdPower.json");

    this.perks = [];
    this.characters = [];
    this.DLCs = [];
    this.powers = [];

    if (!fs.existsSync(perkFilePath)) this.#getPerks();
    else this.perks = JSON.parse(fs.readFileSync(perkFilePath, "utf-8"));

    if (!fs.existsSync(charFilePath)) this.#getCharacters();
    else this.characters = JSON.parse(fs.readFileSync(charFilePath, "utf-8"));

    if (!fs.existsSync(dlcFilePath)) this.#getDLCs();
    else this.DLCs = JSON.parse(fs.readFileSync(dlcFilePath, "utf-8"));

    if (!fs.existsSync(powerFilePath)) this.#getPowers();
    else this.powers = JSON.parse(fs.readFileSync(powerFilePath, "utf-8"));
  }

  #sanitizeHTML = (str: string) =>
    str
      .replace(/<b>(.*?)<\/b>/g, "**$1**")
      .replace(/<br>/g, "\n")
      .replace(/<i>(.*?)<\/i>/g, "*$1*")
      .replace(/<li>(.*?)<\/li>/g, "• $1\n")
      .replace(/&nbsp;/g, " ");

  async #getPerks() {
    interface ObjTunables {
      [key: string]: string[];
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

    const perkData = await axios.get<DBDPerkApiData>(dbdApiUrl + "perks", {
      headers: {
        "User-Agent": "Discord Bot - birbkiwi",
      },
    });

    if (perkData.status !== 200) return console.error(perkData);

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
      } as DBDPerk;
    });

    this.perks = dbdPerks;

    const dbdPerkFilePath = path.join(__dirname, "..", "data", "dbdPerks.json");
    fs.writeFile(dbdPerkFilePath, JSON.stringify(dbdPerks, null, 4), { flag: "w" }, (err) => {
      if (err) throw err;
      console.log("DBD perks retrieved");
    });
  }

  async #getCharacters() {
    interface DBDCharApiData {
      [k: string]: Omit<DBDCharacter, "charid">;
    }

    const charData = await axios.get<DBDCharApiData>(dbdApiUrl + "characters", {
      headers: {
        "User-Agent": "Discord Bot - birbkiwi",
      },
    });

    if (charData.status !== 200) return console.error(charData);

    const dbdChars = Object.entries(charData.data).map(
      ([key, char]) =>
        ({
          charid: key,
          name: char.name,
          role: char.role,
          id: char.id,
          gender: char.gender,
          dlc: char.dlc,
          image: char.image,
          item: char.item,
        } as DBDCharacter)
    );

    this.characters = dbdChars;

    const dbdCharFilePath = path.join(__dirname, "..", "data", "dbdChars.json");
    fs.writeFile(dbdCharFilePath, JSON.stringify(dbdChars, null, 4), { flag: "w" }, (err) => {
      if (err) throw err;
      console.log("DBD chars retrieved");
    });
  }

  async #getDLCs() {
    interface DBDDLCApiData {
      [k: string]: Omit<DBDDLC, "id">;
    }
    const dlcData = await axios.get<DBDDLCApiData>(dbdApiUrl + "dlc", {
      headers: {
        "User-Agent": "Discord Bot - birbkiwi",
      },
    });
    if (dlcData.status !== 200) return console.error(dlcData);

    const dbdDlc = Object.entries(dlcData.data).map(([key, dlc]) => {
      return {
        id: key,
        name: dlc.name,
        steamid: dlc.steamid,
        time: dlc.time,
      } as DBDDLC;
    });

    this.DLCs = dbdDlc;

    const dbdDLCFilePath = path.join(__dirname, "..", "data", "dbdDLC.json");
    fs.writeFile(dbdDLCFilePath, JSON.stringify(dbdDlc, null, 4), { flag: "w" }, (err) => {
      if (err) throw err;
      console.log("DBD dlcs retrieved");
    });
  }

  async #getPowers() {
    interface DBDPowerApiData {
      [k: string]: Omit<DBDPower, "id">;
    }

    const powerData = await axios.get<DBDPowerApiData>(dbdApiUrl + "items", {
      headers: {
        "User-Agent": "Discord Bot - birbkiwi",
      },
      params: {
        role: "killer",
        type: "power",
      },
    });
    if (powerData.status !== 200) return console.error(powerData);

    const dbdPower = Object.entries(powerData.data).map(([key, power]) => ({
      id: key,
      name: this.#sanitizeHTML(power.name),
      description: this.#sanitizeHTML(power.description),
      image: power.image,
    }));

    this.powers = dbdPower;

    const dbdPowerFilePath = path.join(__dirname, "..", "data", "dbdPower.json");
    fs.writeFile(dbdPowerFilePath, JSON.stringify(dbdPower, null, 4), { flag: "w" }, (err) => {
      if (err) throw err;
      console.log("DBD Powers retrieved");
    });
  }

  async getData() {
    this.#getPerks();
    this.#getCharacters();
    this.#getDLCs();
    this.#getPowers();
  }
}
