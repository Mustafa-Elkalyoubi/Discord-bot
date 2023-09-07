import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
} from "discord.js";
import { BaseCommand } from "../utils/BaseCommand";
import ExtendedClient from "../utils/Client";
import axios, { AxiosResponse } from "axios";

interface apiPostResponseJSON {
  images: [string];
  parameters: apiPostRequestPayload;
  info: string;
}

interface apiPostRequestPayload {
  enable_hr?: boolean;
  denoising_strength?: number;
  firstphase_width?: number;
  firstphase_height?: number;
  hr_scale?: number;
  hr_upscaler?: string;
  hr_second_pass_steps?: number;
  hr_resize_x?: number;
  hr_resize_y?: number;
  prompt: string;
  styles?: string[];
  seed?: number;
  subseed?: number;
  subseed_strength?: number;
  seed_resize_from_h?: number;
  seed_resize_from_w?: number;
  sampler_name?: string;
  batch_size?: number;
  n_iter?: number;
  steps?: number;
  cfg_scale?: number;
  width?: number;
  height?: number;
  restore_faces?: boolean;
  tiling?: boolean;
  do_not_save_samples?: boolean;
  do_not_save_grid?: boolean;
  negative_prompt?: string;
  eta?: number;
  s_churn?: number;
  s_tmax?: number;
  s_tmin?: number;
  s_noise?: number;
  override_settings?: { [k: string]: string };
  override_settings_restore_afterwards?: boolean;
  script_args?: [];
  sampler_index?: string;
  script_name?: string;
  send_images?: boolean;
  save_images?: boolean;
  alwayson_scripts?: { [k: string]: string };
}

interface apiGetProgressResponseJSON {
  progress: number;
  eta_relative: number;
  state: {
    skipped: boolean;
    interrupted: boolean;
    job: string;
    job_count: number;
    job_timestamp: string;
    job_no: number;
    sampling_step: number;
    sampling_steps: number;
  };
  current_image: string;
  textinfo: string;
}

export default class Command extends BaseCommand {
  constructor() {
    super("text2img");
  }

  LORAs: { name: string; fileName: string; trigger: string }[] = [
    { name: "Aatrox", fileName: "Aatrox-03", trigger: "GodKing" },
    {
      name: "Ahri",
      fileName: "ahri-000045",
      trigger: "ahri, ahri (league of legends)",
    },
    { name: "Akali", fileName: "akali_v2-000038", trigger: "akali" },
    {
      name: "Arcane Style",
      fileName: "arcane_offset",
      trigger: "arcane style",
    },
    { name: "Dark Elf", fileName: "drow_offset", trigger: "drow, dark elf" },
    { name: "food", fileName: "foodphoto", trigger: "foodphoto" },
    { name: "Illaoi", fileName: "illaoi-000008", trigger: "illaoi" },
    { name: "Irelia", fileName: "ireliav2-000034", trigger: "irelia" },
    { name: "Jinx", fileName: "JinxLol", trigger: "jinxlol" },
    {
      name: "Katarina",
      fileName: "katarina-nvwls-v1-final",
      trigger: "Katarina",
    },
    { name: "LOL Splash Art", fileName: "LoL Splash V02", trigger: "" },
    {
      name: "Lucy (Cyberpunk)",
      fileName: "lucy_offset",
      trigger: "lucy (cyberpunk)",
    },
    {
      name: "Neeko",
      fileName: "neeko-nvwls-v1-final",
      trigger:
        "neeko, facial marks, hair ornaments, hair flower, necklace, brown shorts, crop top, lizard tail",
    },
    { name: "Pantheon", fileName: "Pantheon-07", trigger: "pant" },
    {
      name: "Punk / Goth / Rock",
      fileName: "punk_v0.2",
      trigger: "punk",
    },
    {
      name: "Samira",
      fileName: "samira-000033",
      trigger: "samira (league of legends)",
    },
    {
      name: "Seraphine",
      fileName: "Seraphine_Psuedo",
      trigger: "xyzseraphine",
    },
    { name: "Sett", fileName: "Sett", trigger: "Sett" },
    {
      name: "Sylas",
      fileName: "sylas_lol-000011",
      trigger: "sylas (league of legends), 1boy, male focus, topless male, shackles, chain",
    },
    { name: "Vi", fileName: "Vi Kangaxx", trigger: "vi_tpa" },
    {
      name: "Warframe",
      fileName: "warframe_v1-000012",
      trigger: "WARFRAME",
    },
    { name: "Xayah", fileName: "xayah-000036", trigger: "xayah" },
    { name: "Xenomorph", fileName: "xenomilf", trigger: "monster girl, black skin" },
    {
      name: "Yasuo",
      fileName: "yspro",
      trigger: "ys, 1boy, pectorals, ponytail",
    },
  ].sort((a, b) => a.name.localeCompare(b.name));

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
            { name: "768x512", value: "768x512" },
            { name: "680x240", value: "680x240" }
          )
      )
      .addStringOption((option) => {
        option.setName("lora").setDescription("Add a specific character");
        if (this.LORAs.length <= 25)
          return option.setChoices(
            ...this.LORAs.map((lora) => ({ name: lora.name, value: lora.name }))
          );
        return option.setAutocomplete(true);
      })
      .addBooleanOption((option) =>
        option.setName("detaillora").setDescription("Use detail lora? (default true)")
      )
      .addStringOption((option) =>
        option.setName("negativeprompt").setDescription("Things you really dont want to include")
      )
      .addIntegerOption((option) =>
        option.setName("seed").setDescription("-1 for random (default)")
      )
      .addNumberOption((option) =>
        option
          .setName("cfgscale")
          .setDescription(
            "How close you want the ai to follow the prompt (higher = closer) (0-20) (default 15)"
          )
          .setMinValue(0)
          .setMaxValue(20)
      )
      .addNumberOption((option) =>
        option
          .setName("denoise")
          .setDescription(
            "How similar everything will be in the image (higher = less similar) (0-1) (default 0.5)"
          )
          .setMinValue(0)
          .setMaxValue(1)
      )
      .addNumberOption((option) =>
        option
          .setName("upscale")
          .setDescription(
            "Upscale the image by Nx (max 2 cuz fuck off, min 1) (default 1) (1.2 - 1.4 is a good scale)"
          )
          .setMinValue(1)
          .setMaxValue(2)
      )
      .toJSON();
  }

  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused() ?? "";
    const filtered = this.LORAs.filter((lora) =>
      lora.name.toLowerCase().includes(focusedValue.toLowerCase())
    );

    if (!filtered) return interaction.respond([]);

    if (filtered.length <= 25)
      return interaction.respond(filtered.map((lora) => ({ name: lora.name, value: lora.name })));

    interaction.respond(
      filtered.slice(0, 25).map((lora) => ({ name: lora.name, value: lora.name }))
    );
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
    const cfg_scale = interaction.options.getNumber("cfgscale") ?? 7;
    const denoising_strength = interaction.options.getNumber("denoise") ?? 0.7;
    const hr_scale = interaction.options.getNumber("upscale") ?? 1;
    const resolution = interaction.options.getString("resolution") ?? "512x768";
    const [width, height] = resolution.split("x").map((n) => parseInt(n));
    const inputLora = interaction.options.getString("lora");
    const addDetailLora = interaction.options.getBoolean("detaillora") ?? true;

    let formattedLora = "";
    if (inputLora) {
      const selectedLora = this.LORAs.filter((_lora) =>
        _lora.name.toLowerCase().includes(inputLora.toLowerCase())
      )[0];
      if (!selectedLora)
        return interaction.editReply("Try selecting from the lora list, dont type it in manually");
      formattedLora += `<lora:${selectedLora.fileName}:1> ${selectedLora.trigger}`;
    }

    if (
      cfg_scale < 0 ||
      cfg_scale > 20 ||
      denoising_strength < 0 ||
      denoising_strength > 1 ||
      hr_scale > 2 ||
      hr_scale < 1
    )
      return interaction.reply({ content: "Fucking read the things idiot", ephemeral: true });
    if (
      queue.map((q) => q.userID).includes(interaction.user.id) &&
      interaction.user.id !== client.ownerID
    )
      return interaction.reply({
        content: "Wait for your previous thing to finish madge",
        ephemeral: true,
      });

    await interaction.deferReply();

    const data: apiPostRequestPayload = {
      enable_hr: true,
      hr_scale: hr_scale,
      hr_upscaler: "Latent",
      prompt:
        "(masterpiece, best quality, ultra-detailed, best shadow), (detailed background), high contrast, (best illumination), colorful, hyper detail, intricate details, (" +
        prompt +
        ")" +
        ", " +
        formattedLora +
        `${addDetailLora && "<lora:add_detail:1>"}`,
      negative_prompt: "(worst quality, low quality:1.4), monochrome, zombie," + negativePrompt,
      sampler_index: "DPM++ 2M Karras",
      steps: 25,
      height: height,
      width: width,
      cfg_scale: cfg_scale,
      denoising_strength: denoising_strength,
      seed: seed,
    };

    queue.push({ userID: interaction.user.id, interactionID: interaction.id });

    const apiURL = "http://127.0.0.1:7861/sdapi/v1/";

    let result: Promise<AxiosResponse<apiPostResponseJSON>> | undefined;
    try {
      result = axios.post<apiPostResponseJSON>(apiURL + "txt2img", data, {
        headers: { "Content-Type": "application/json" },
      });
      // eslint-disable-next-line
    } catch (err: any) {
      if (!err) return;
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

    if (queue[0].interactionID !== interaction.id) {
      interaction.editReply("Waiting for your turn...");
    }
    while (queue[0].interactionID !== interaction.id) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    const updater = setInterval(async () => {
      const update = await axios.get<apiGetProgressResponseJSON>(apiURL + "progress", {
        headers: { "Content-Type": "application/json" },
      });
      if (update.data.current_image !== null) {
        const stream = Buffer.from(update.data.current_image, "base64");
        interaction.editReply({
          content: `${
            update.data.state.job_no === 1 ? "**Upscaling**\n" : "**Generating**\n"
          }Progress: \`${Math.floor(update.data.progress * 100)}%\``,
          files: [{ attachment: stream, name: "img.png" }],
        });
      }
    }, 7000);

    if (!result) {
      queue.shift();
      return interaction.editReply(`An unknown error has occurred`);
    }

    await Promise.all([result]).then((_res) => {
      clearInterval(updater);
      const res = _res[0];

      if (res.status !== 200) {
        queue.shift();
        return interaction.editReply(`Error code \`${res.status}\``);
      }

      const stream = Buffer.from(res.data.images[0], "base64");
      interaction.editReply({
        content: `**Seed**: \`${JSON.parse(res.data.info).seed}\``,
        files: [{ attachment: stream, name: "img.png" }],
      });
      queue.shift();
      return;
    });
    clearInterval(updater);
  }
}
