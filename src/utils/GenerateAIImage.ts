import axios, { AxiosError } from "axios";
import { ChatInputCommandInteraction } from "discord.js";
import ExtendedClient from "./Client";

const apiURL = "http://127.0.0.1:7861/sdapi/v1/";

interface apiPostResponseJSON {
  images: [string];
  parameters: apiPostRequestPayload;
  info: Stringified<Text2ImageInfo>;
}

type Text2ImageInfo = {
  prompt: string;
  all_prompts: string[];
  negative_prompt: string;
  all_negative_prompts: string[];
  seed: number;
  all_seeds: number[];
  subseed: number;
  all_subseeds: number[];
  subseed_strength: number;
  cfg_scale: number;
  steps: number;
  batch_size: number;
  restore_faces: boolean;
  face_restoration_model: null | string;
  sd_model_name: string;
  sd_model_hash: string;
  sd_vae_name: string | null;
  sd_vae_hash: string | null;
  seed_resize_from_w: number;
  seed_resize_from_h: number;
  denoising_strength: number;
  extra_generation_params: {
    "Denoising strength": number;
    "Hires upscale": number;
    "Hires upscaler": string;
  };
  index_of_first_image: number;
  infotexts: string[];
  styles: string[];
  job_time: string;
  clip_skip: number;
  is_using_inpainting_conditioning: boolean;
  version: string;
};

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

export type AITask = {
  interaction: ChatInputCommandInteraction;
  client: ExtendedClient;

  prompt: string;
  hr_scale: number;
  formattedLora: string;
  addDetailLora: boolean;
  negativePrompt: string;
  seed: number;
  cfg_scale: number;
  denoising_strength: number;
  width: number;
  height: number;
};

async function generateAIImage({
  interaction,
  prompt,
  hr_scale,
  formattedLora,
  addDetailLora,
  negativePrompt,
  seed,
  cfg_scale,
  denoising_strength,
  width,
  height,
  client,
}: AITask) {
  interaction.editReply("Generating...");

  const data: apiPostRequestPayload = {
    enable_hr: true,
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
    height,
    width,
    cfg_scale,
    denoising_strength,
    seed,
    hr_scale,
  };

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

  const res = await axios
    .post<apiPostResponseJSON>(apiURL + "txt2img", data, {
      headers: { "Content-Type": "application/json" },
    })
    .catch((err: Error | AxiosError) => {
      if (axios.isAxiosError(err)) {
        if (err.cause && err.cause.name === "ECONNREFUSED") {
          interaction.editReply(
            "Sorry, I forgot to turn the model on lmao (feel free to spam me if im afk)"
          );

          return;
        }

        if (!err.response) {
          console.log(err);
          interaction.editReply("Sorry, something went wrong");
          return;
        }

        if (err.response.data.error === "OutOfMemoryError") {
          interaction.editReply("Sorry, ran out of memory :(");
          return;
        }
      }

      console.error(err);
      interaction.editReply("Sorry, something went wrong");
    });

  clearInterval(updater);
  client.activeCommands.dec();

  if (!res) return;

  if (res.status !== 200) {
    interaction.editReply(`Error code \`${res.status}\``);
    return;
  }

  const info = JSON.parse(res.data.info);

  const stream = Buffer.from(res.data.images[info.index_of_first_image], "base64");
  interaction.editReply({
    content: `**Seed**: \`${info.seed}\``,
    files: [{ attachment: stream, name: "img.png" }],
  });
}

export default generateAIImage;
