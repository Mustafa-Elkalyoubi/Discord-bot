import { SlashCommandBuilder, ChatInputCommandInteraction, RESTJSONErrorCodes } from "discord.js";
import { BaseCommand } from "../utils/BaseCommand";
import ExtendedClient from "../utils/Client";
import axios, { AxiosError, AxiosResponse } from "axios";

interface responseJSON {
  images: [string];
  parameters: {};
  info: string;
}

export default class Command extends BaseCommand {
  constructor() {
    super("text2img");
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Generate an image with a text prompt!")
      .addStringOption((option) =>
        option
          .setName("prompt")
          .setDescription("Comma seperated tags, use () for emphasis")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("resolution")
          .setDescription("Set the resolution")
          .addChoices(
            { name: "512x512", value: "512x512" },
            { name: "768x768", value: "768x768" },
            { name: "512x768", value: "512x768" },
            { name: "768x512", value: "768x512" }
          )
      )
      .addStringOption((option) =>
        option.setName("negativeprompt").setDescription("Things you really dont want to include")
      )
      .addIntegerOption((option) =>
        option.setName("seed").setDescription("-1 for random (default)")
      )
      .addIntegerOption((option) =>
        option
          .setName("cfgscale")
          .setDescription(
            "How close you want the ai to follow the prompt (higher = closer) (0-20) (default 15)"
          )
      )
      .addIntegerOption((option) =>
        option
          .setName("denoise")
          .setDescription(
            "How similar everything will be in the image (higher = less similar) (0-1) (default 0.5)"
          )
      )
      .addStringOption((option) =>
        option
          .setName("upscale")
          .setDescription(
            "Upscale the image by Nx (max 2 cuz fuck off, min 1) (default 1) (1.2 - 1.4 is a good scale)"
          )
      )
      .toJSON();
  }

  async run(interaction: ChatInputCommandInteraction, client: ExtendedClient) {
    if (!client.aiEnabled && interaction.user.id !== client.ownerID)
      return interaction.reply({
        content: "This command is temporarily disabled (my poor gpu man cmon)",
        ephemeral: true,
      });

    const queue = client.aiQueue;
    const prompt = interaction.options.getString("prompt");
    const negativePrompt = interaction.options.getString("negativeprompt") ?? "";
    const seed = interaction.options.getInteger("seed") ?? -1;
    const cfg_scale = interaction.options.getInteger("cfgscale") ?? 7;
    const denoising_strength = interaction.options.getInteger("denoise") ?? 0.7;
    const hr_scale = parseFloat(interaction.options.getString("upscale") ?? "1");
    const res = interaction.options.getString("resolution") ?? "512x768";
    const [width, height] = res.split("x").map((n) => parseInt(n));

    if (
      cfg_scale < 0 ||
      cfg_scale > 20 ||
      denoising_strength < 0 ||
      denoising_strength > 1 ||
      hr_scale > 2 ||
      hr_scale < 1
    )
      return interaction.reply({ content: "Fucking read the things idiot", ephemeral: true });
    if (queue.includes(interaction.user.id) && interaction.user.id !== client.ownerID)
      return interaction.reply({
        content: "Wait for your previous thing to finish madge",
        ephemeral: true,
      });

    await interaction.deferReply();

    const LORAs = "";

    var data = {
      enable_hr: true,
      hr_scale: hr_scale,
      hr_upscaler: "Latent",
      prompt:
        "(masterpiece, best quality, ultra-detailed, best shadow), (detailed background), high contrast, (best illumination), colorful, hyper detail, intricate details, (" +
        prompt +
        ")",
      negative_prompt: "(worst quality, low quality:1.4), monochrome, zombie," + negativePrompt,
      sampler_index: "DPM++ 2M Karras",
      steps: 25,
      height: height,
      width: width,
      cfg_scale: cfg_scale,
      denoising_strength: denoising_strength,
      seed: seed,
    };

    queue.push(interaction.user.id);

    var result: AxiosResponse | undefined;
    try {
      result = await axios.post("http://127.0.0.1:7861/sdapi/v1/txt2img", data, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.log(err.detail);
      queue.shift();
      if (axios.isAxiosError(err)) {
        if (err.cause && err.cause.name === "ECONNREFUSED")
          return interaction.editReply(
            "Sorry, I forgot to turn the model on lmao (feel free to spam me if im afk)"
          );
        console.error(err);
      }
      if (!err.response) {
        console.log(err);
        interaction.editReply("Sorry, something went wrong");
        return;
      }
      if (err.response.data.error === "OutOfMemoryError") {
        return interaction.editReply("Sorry, ran out of memory :(");
      }
      console.log(err.detail);
      interaction.editReply("Sorry, something went wrong");
    }

    if (!result) {
      queue.shift();
      return interaction.editReply(`An unknown error has occurred`);
    }

    if (result.status !== 200) {
      queue.shift();
      return interaction.editReply(`Error code \`${result.status}\``);
    }

    const stream = Buffer.from(result.data.images[0], "base64");
    interaction.editReply({
      content: `**Seed**: \`${JSON.parse(result.data.info).seed}\``,
      files: [{ attachment: stream, name: "img.png" }],
    });
    queue.shift();
  }
}
