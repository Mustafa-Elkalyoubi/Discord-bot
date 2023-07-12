import {
  ChatInputCommandInteraction,
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
  const res = await axios.get(apiURL).catch((err) => {
    console.error(err);
  });

  if (!res) {
    return stepPrinter("Sorry, something went wrong");
  }

  const emoteData: sevenTVResponse = res.data;

  if (name === "") {
    stepPrinter("Requesting emote name");

    name = emoteData.name;

    stepPrinter(`Name found: ${name}`);
    if (name.length > 32)
      return stepPrinter(
        `Error: Name is too long; Max length is 32 characters (emote is ${name.length})`
      );
    if (name.length < 2) {
      return stepPrinter(`Error: name is too short`);
    }
  }

  stepPrinter(`Emote is ${emoteData.animated ? "" : "not "}animated`);

  const emoteURL = "https:" + emoteData.host.url + `${emoteData.animated ? "/4x.gif" : "/4x.png"}`;

  stepPrinter("Grabbing highest res");

  const getImgBuffer = async (url: string, size: number): Promise<Buffer | null | undefined> => {
    url = url.replace("4x.", `${size}x.`);
    var input: AxiosResponse<any, any> | null = null;
    try {
      input = await axios.get(emoteURL, {
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
        if (size < MAX_SIZE) break;
      } catch (e) {
        console.error(e);
      }
      if (i === 1) {
        stepPrinter("Bro even 1x is bad, wtf kinda gif is this");
        break;
      }
      stepPrinter(`${i}x garbage quality is also too large, grabbing ${i - 1}x...`);
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
    .catch((err) => {
      if (err.code === RESTJSONErrorCodes.MaximumNumberOfEmojisReached) {
        return stepPrinter("Maximum number of emojis reached");
      }
      if (err.code == RESTJSONErrorCodes.MaximumNumberOfAnimatedEmojisReached) {
        return stepPrinter("Maximum number of animated emojis reached");
      }
      if (err.code === RESTJSONErrorCodes.FailedToResizeAssetBelowTheMinimumSize) {
        return stepPrinter("Emote file size is too big.. do it yourself  : ^)");
      }
      stepPrinter(`An error has occurred: ${err.rawError.message}`);
      console.error(err);
      console.log(`Name: ${name}\nLink: ${emoteURL}`);
      console.log(`Size: ${Buffer.byteLength(imgBuffer ?? "")}`);
    });
}

export { steal7TV };
