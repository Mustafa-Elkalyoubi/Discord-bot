import axios, { AxiosRequestConfig } from "axios";
import mongoose from "mongoose";
import SteamApps, { SteamApp } from "../../models/SteamApps.js";

const steamURL = "https://api.steampowered.com";

class SteamManager {
  async findAppByName(name: string): Promise<SteamApp | null>;
  async findAppByName(name: string, limit: number): Promise<SteamApp[]>;
  async findAppByName(name: string, limit?: number): Promise<SteamApp | null | SteamApp[]> {
    try {
      if (typeof limit === "number")
        return (
          await SteamApps.find({
            name: { $regex: name, $options: "i" },
          })
            .sort({ name: "asc" })
            .limit(limit)
        ).map((p) => p.toObject());
      else
        return (
          (
            await SteamApps.findOne({
              name: { $regex: name, $options: "i" },
            })
          )?.toObject() ?? null
        );
    } catch (e) {
      if (e) console.error(e);
      return typeof limit === "number" ? [] : null;
    }
  }

  async findAppByID(appID: number): Promise<SteamApp | null>;
  async findAppByID(appID: number, limit: number): Promise<SteamApp[]>;
  async findAppByID(appID: number, limit?: number): Promise<SteamApp | null | SteamApp[]> {
    try {
      if (typeof limit === "number")
        return (
          await SteamApps.find({
            appID,
          })
        ).map((d) => d.toObject());
      else
        return (
          (
            await SteamApps.findOne({
              appID,
            })
          )?.toObject() ?? null
        );
    } catch (e) {
      if (e) console.error(e);
      return typeof limit === "number" ? [] : null;
    }
  }

  static async getApps() {
    const apiURL = steamURL + "/ISteamApps/GetAppList/v2/";
    const config: AxiosRequestConfig = {
      params: {
        key: process.env.STEAM_KEY,
      },
      timeout: 60000,
    };

    interface SteamAppResponse {
      applist: {
        apps: {
          appid: number;
          name: string;
        }[];
      };
    }

    const res = await axios.get<SteamAppResponse>(apiURL, config);

    const ops: mongoose.AnyBulkWriteOperation<SteamApp>[] = res.data.applist.apps.map((item) => ({
      updateOne: {
        filter: { appID: item.appid },
        update: { appID: item.appid, name: item.name },
        upsert: true,
      },
    }));

    try {
      const result = await SteamApps.bulkWrite(ops);
      if (result.ok) return true;
    } catch (e) {
      if (e) console.error(e);
      return false;
    }
  }
}

export default SteamManager;
