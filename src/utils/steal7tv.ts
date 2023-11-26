import {
  ChatInputCommandInteraction,
  DiscordAPIError,
  MessageContextMenuCommandInteraction,
  RESTJSONErrorCodes,
} from "discord.js";
import axios, { AxiosResponse } from "axios";
import { StepPrinter } from "./StepPrinter";
import sharp from "sharp";
import ufs from "url-file-size";

interface sevenTVResponse {
  id: string;
  name: string;
  flags: number;
  tags: string[];
  lifecycle: number;
  state: string[];
  listed: boolean;
  animated: boolean;
  owner: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    style: { [k: string]: string };
    roles: string[];
  };
  host: {
    url: string;
    files: {
      name: string;
      static_name: string;
      width: number;
      height: number;
      frame_count: number;
      size: number;
      format: string;
    }[];
  };
  versions: {
    id: string;
    name: string;
    description: string;
    lifecycle: number;
    state: string[];
    listed: boolean;
    animated: boolean;
    createdAt: number;
  }[];
}

async function steal7TV(
  interaction: ChatInputCommandInteraction | MessageContextMenuCommandInteraction,
  url: string,
  name: string
) {
  if (!url.includes("7tv.app")) return interaction.editReply({ content: "Not a 7tv.app link" });
  const stepPrinter = StepPrinter(interaction);

  stepPrinter("Stealing 7tv emote", "INFO", true);

  const emoteID = url.slice(url.indexOf("7tv.app")).split("/")[2];
  const apiURL = `https://7tv.io/v3/emotes/${emoteID}`;
  const res = await axios
    .get<sevenTVResponse>(apiURL, { headers: { "User-Agent": "Discord Bot" } })
    .catch((err) => {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        } else if (err.request) {
          stepPrinter("7tv is being stupid", "NEGATIVE");
          // console.log("Here");
          // console.log(err.request);
        } else {
          console.log("Error", err.message);
        }
        // console.log(err.toJSON());
        return console.log(err.config);
      }
      console.error(err);
    });

  if (!res) {
    return stepPrinter("Sorry, something went wrong", "NEGATIVE");
  }

  const emoteData = res.data;

  if (name === "") {
    stepPrinter("Requesting emote name");
    name = emoteData.name;
  }

  if (name.length > 32)
    return stepPrinter(
      `Error: Name is too long; Max length is 32 characters (emote is ${name.length})`,
      "NEGATIVE"
    );

  if (name.length < 2) return stepPrinter(`Error: name is too short`, "NEGATIVE");

  stepPrinter(`Name ${name}`, "POSITIVE");
  const nameReg = /[^\w\d_]/g;
  const invalidReasons = Array.from(new Set(name.match(nameReg)));
  if (invalidReasons.length > 0)
    return stepPrinter("Error: the name cannot include: " + invalidReasons.join(" | "), "NEGATIVE");

  stepPrinter(`Emote is ${emoteData.animated ? "" : "not "}animated`, "INFO");

  let emoteURL = "https:" + emoteData.host.url + `${emoteData.animated ? "/4x.gif" : "/4x.png"}`;
  let imgBuffer: Buffer | null | string | undefined = null;
  const MAX_SIZE = 262144;
  let imgTooBig = false;

  stepPrinter("Grabbing highest res", "INFO");
  for (let i = 4; i > 0; i--) {
    imgBuffer = await getImgBuffer(emoteURL, i, emoteData.animated);
    if (!imgBuffer) continue;
    if (Buffer.byteLength(imgBuffer) < MAX_SIZE) break;

    if (i === 1) {
      stepPrinter(
        "1x is too large.. lowering quality to garbage (artifacting can happen)",
        "NEGATIVE"
      );
      imgTooBig = true;
      break;
    }

    stepPrinter(`${i}x is too large, grabbing ${i - 1}x...`, i <= 3 ? "NEGATIVE" : "INFO");
  }

  if (!imgBuffer) return stepPrinter("An unknown error occurred", "NEGATIVE");

  if (imgTooBig) {
    for (let i = 4; i > 0; i--) {
      let size;
      try {
        size = await ufs(emoteURL);
        if (size < MAX_SIZE) {
          imgBuffer = emoteURL;
          break;
        }
      } catch (e) {
        console.error(e);
      }
      if (i === 1) {
        stepPrinter("Bro even 1x is too high, trying anyway...", "NEGATIVE");
        break;
      }
      stepPrinter(`${i}x garbage quality is also too large, grabbing ${i - 1}x...`, "NEGATIVE");
      emoteURL = emoteURL.replace(`${i}x.`, `${i - 1}x.`);
    }
  }

  interaction
    .guild!.emojis.create({ attachment: imgBuffer, name: name })
    .then((emoji) => {
      stepPrinter("Done!", "POSITIVE");
      setTimeout(() => {
        interaction.editReply({ content: emoji.toString() });
      }, 2000);
    })
    .catch(async (err) => {
      if (err instanceof DiscordAPIError) {
        if (err.code === RESTJSONErrorCodes.MaximumNumberOfEmojisReached) {
          return stepPrinter("Maximum number of emojis reached", "NEGATIVE");
        }
        if (err.code == RESTJSONErrorCodes.MaximumNumberOfAnimatedEmojisReached) {
          return stepPrinter("Maximum number of animated emojis reached", "NEGATIVE");
        }
        if (err.code === RESTJSONErrorCodes.FailedToResizeAssetBelowTheMinimumSize) {
          return stepPrinter(
            `Emote file size is too big.. (MAX: ${Math.round(
              MAX_SIZE / 1000
            )}KB, this file: ${Math.round((await ufs(emoteURL)) / 1000)}KB)`,
            "NEGATIVE"
          );
        }
        if (err.code === RESTJSONErrorCodes.InvalidFormBodyOrContentType) {
          console.log(err);
        }
      }
      stepPrinter(`An error has occurred: ${err.rawError.message}`, "NEGATIVE");
      console.error(err);
      console.log(`Name: ${name}\nLink: ${emoteURL}`);
      console.log(`Size: ${Buffer.byteLength(imgBuffer ?? "")}`);
    });
}

const getImgBuffer = async (
  url: string,
  size: number,
  animated: boolean
): Promise<Buffer | null | undefined> => {
  url = url.replace("4x.", `${size}x.`);
  let input: AxiosResponse<string> | null = null;
  try {
    input = await axios.get<string>(url, {
      responseType: "arraybuffer",
      timeout: 60000,
    });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.cause && err.cause.name !== "ECONNREFUSED") console.error(err);
    }
  }

  if (!input) return null;

  return animated
    ? await sharp(input.data, { animated }).gif().toBuffer()
    : await sharp(input.data, { animated }).png().toBuffer();
};

export { steal7TV };
