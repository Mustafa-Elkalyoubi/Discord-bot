import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
} from "discord.js";
import BaseCommand from "../utils/BaseCommand.js";
import ExtendedClient from "../utils/Client.js";

export default class Text2Img extends BaseCommand implements Command {
  constructor() {
    super("text2img", true);
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
    if (!client.aiProcess && interaction.user.id !== client.ownerID)
      return interaction.reply({
        content: "This command is temporarily disabled (my poor gpu man cmon)",
        ephemeral: true,
      });

    const queue = client.aiQueue;
    const prompt = interaction.options.getString("prompt")!;
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

    if (queue.idle) await interaction.reply("Waiting for your turn");
    else await interaction.deferReply();

    // client.activeCommands.inc(1);
    queue.add({
      interaction,
      addDetailLora,
      cfg_scale,
      denoising_strength,
      formattedLora,
      height,
      width,
      negativePrompt,
      prompt,
      seed,
      hr_scale,
      client,
    });
  }
}
