import {
  ChatInputCommandInteraction,
  DiscordAPIError,
  MessageContextMenuCommandInteraction,
  RESTJSONErrorCodes,
} from "discord.js";
import axios, { AxiosError, AxiosResponse } from "axios";
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
    style: {};
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

  stepPrinter("Stealing 7tv emote", true);

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
          stepPrinter("7tv is being stupid");
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
    return stepPrinter("Sorry, something went wrong");
  }

  const emoteData = res.data;

  if (name === "") {
    stepPrinter("Requesting emote name");

    name = emoteData.name;
  }

  if (name.length > 32)
    return stepPrinter(
      `Error: Name is too long; Max length is 32 characters (emote is ${name.length})`
    );

  if (name.length < 2) {
    return stepPrinter(`Error: name is too short`);
  }

  stepPrinter(`Name ${name}`);
  const nameReg = /[^\w\d_]/g;
  const invalidReasons = Array.from(new Set(name.match(nameReg)));
  if (invalidReasons.length > 0) {
    return stepPrinter("Error: the name cannot include: " + invalidReasons.join(" | "));
  }

  stepPrinter(`Emote is ${emoteData.animated ? "" : "not "}animated`);

  var emoteURL = "https:" + emoteData.host.url + `${emoteData.animated ? "/4x.gif" : "/4x.png"}`;

  stepPrinter("Grabbing highest res");

  const getImgBuffer = async (url: string, size: number): Promise<Buffer | null | undefined> => {
    url = url.replace("4x.", `${size}x.`);
    var input: AxiosResponse<any, any> | null = null;
    try {
      input = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 60000,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.cause && err.cause.name !== "ECONNREFUSED") console.error(err);
      }
    }

    if (!input) return null;

    return emoteData.animated
      ? await sharp(input.data, { animated: true }).gif().toBuffer()
      : await sharp(input.data, { animated: false }).png().toBuffer();
  };

  var imgBuffer: Buffer | null | string | undefined = null;
  const MAX_SIZE = 262144;
  var imgTooBig = false;

  for (var i = 4; i > 0; i--) {
    imgBuffer = await getImgBuffer(emoteURL, i);
    if (!imgBuffer) continue;
    if (Buffer.byteLength(imgBuffer) < MAX_SIZE) break;

    if (i === 1) {
      stepPrinter("1x is too large.. lowering quality to garbage (artifacting can happen)");
      imgTooBig = true;
      break;
    }

    stepPrinter(`${i}x is too large, grabbing ${i - 1}x...`);
  }

  if (!imgBuffer) return stepPrinter("An unknown error occurred");

  if (imgTooBig) {
    for (var i = 4; i > 0; i--) {
      var size;
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
        stepPrinter("Bro even 1x is too high, trying anyway...");
        break;
      }
      stepPrinter(`${i}x garbage quality is also too large, grabbing ${i - 1}x...`);
      emoteURL = emoteURL.replace(`${i}x.`, `${i - 1}x.`);
    }
  }

  interaction
    .guild!.emojis.create({ attachment: imgBuffer, name: name })
    .then((emoji) => {
      stepPrinter("Done!");
      setTimeout(() => {
        interaction.editReply({ content: emoji.toString() });
      }, 2000);
    })
    .catch(async (err) => {
      if (err instanceof DiscordAPIError) {
        if (err.code === RESTJSONErrorCodes.MaximumNumberOfEmojisReached) {
          return stepPrinter("Maximum number of emojis reached");
        }
        if (err.code == RESTJSONErrorCodes.MaximumNumberOfAnimatedEmojisReached) {
          return stepPrinter("Maximum number of animated emojis reached");
        }
        if (err.code === RESTJSONErrorCodes.FailedToResizeAssetBelowTheMinimumSize) {
          return stepPrinter(
            `Emote file size is too big.. (MAX: ${Math.round(
              MAX_SIZE / 1000
            )}KB, this file: ${Math.round((await ufs(emoteURL)) / 1000)}KB)`
          );
        }
        if (err.code === RESTJSONErrorCodes.InvalidFormBodyOrContentType) {
          console.log(err);
        }
      }
      stepPrinter(`An error has occurred: ${err.rawError.message}`);
      console.error(err);
      console.log(`Name: ${name}\nLink: ${emoteURL}`);
      console.log(`Size: ${Buffer.byteLength(imgBuffer ?? "")}`);
    });
}

export { steal7TV };
