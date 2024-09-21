import { SlashCommandBuilder, ChatInputCommandInteraction, codeBlock } from "discord.js";
import BaseCommand from "../utils/BaseCommand.js";
import ytdl from "ytdl-core";
import { DateTime, Duration } from "luxon";
import ffmpeg from "fluent-ffmpeg";
import type internal from "stream";
import fs from "node:fs";

const FORMATS = ["mp4", "mp3"] as const;

export default class YTDownloader extends BaseCommand implements Command {
  constructor() {
    super("youtubedownloader");
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("Download youtube vids")
      .addStringOption((option) =>
        option.setName("url").setDescription("The youtube video url").setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("format")
          .setDescription("Video format")
          .setChoices(...FORMATS.map((v) => ({ name: v, value: v })))
          .setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("start").setDescription("Start Time (use hh:mm:ss)")
      )
      .addStringOption((option) => option.setName("end").setDescription("end Time (use hh:mm:ss)"))
      .toJSON();
  }

  async run(interaction: ChatInputCommandInteraction) {
    const url = interaction.options.getString("url")!;
    const format = interaction.options.getString("format")! as (typeof FORMATS)[number];
    const startTime = interaction.options.getString("start");
    const endTime = interaction.options.getString("end");

    if (!ytdl.validateURL(url))
      return interaction.reply({ content: "Not a valid youtube url", ephemeral: true });

    let startSeconds = 0;
    if (startTime) {
      try {
        startSeconds = parseTime(startTime);
      } catch (e) {
        if (e === "too long") return interaction.reply("Im not processing a video that long");
        if (e === "non digits")
          return interaction.reply(
            "Your start time includes non-digit values, please use hh:mm:ss or mm:ss or ss"
          );
      }
    }

    let endSeconds = 0;
    if (endTime) {
      try {
        endSeconds = parseTime(endTime);
      } catch (e) {
        if (e === "too long") return interaction.reply("Im not processing a video that long");
        if (e === "non digits")
          return interaction.reply(
            "Your end time includes non-digit values, please use hh:mm:ss or mm:ss or ss"
          );
      }
    }

    const vidInfo = await ytdl.getInfo(url);
    if (endSeconds === 0 || endSeconds >= parseFloat(vidInfo.videoDetails.lengthSeconds))
      endSeconds = parseFloat(vidInfo.videoDetails.lengthSeconds);

    if (endSeconds < startSeconds) return interaction.reply("Start time is after end time?");
    if (parseFloat(vidInfo.videoDetails.lengthSeconds) > 30 * 60)
      return interaction.reply("max video length is 30 mins");

    const tracker = {
      start: DateTime.now(),
      audio: { downloaded: 0, total: Infinity },
      video: { downloaded: 0, total: Infinity },
      merged: { frame: 0, percentage: 0, fps: 0 },
      uploading: false,
    };

    const toMB = (i: number) => (i / 1024 / 1024).toFixed(2);

    const getMessage = () =>
      `Running for ${DateTime.now().diff(tracker.start).toHuman({ listStyle: "long" })}\n\n• Audio: ${(
        (tracker.audio.downloaded / tracker.audio.total) *
        100
      ).toFixed(2)}% processed\nDownloaded: ${toMB(tracker.audio.downloaded)}MB | Total: ${toMB(
        tracker.audio.total
      )}MB\n\n${
        format === "mp4"
          ? `• Video: ${((tracker.video.downloaded / tracker.video.total) * 100).toFixed(
              2
            )}% processed\nDownloaded:${toMB(tracker.video.downloaded)}MB | Total: ${toMB(
              tracker.video.total
            )}MB\n\n• Merged: frame #${tracker.merged.frame}\nDone (approx): ${(
              tracker.merged.percentage * 100
            ).toFixed(
              2
            )}% | fps: ${tracker.merged.fps}\n\n${tracker.uploading ? "• Uploading to discord..." : ""}`
          : `${tracker.uploading ? "• Uploading to discord..." : ""}`
      }`;

    interaction.reply(codeBlock("md", getMessage()));
    const updateInterval = setInterval(() => {
      interaction.editReply(codeBlock("md", getMessage()));
    }, 3000);

    const audioStream = ytdl(url, {
      quality: "highestaudio",
    }).on("progress", (_, downloaded: number, total: number) => {
      tracker.audio = { ...tracker.audio, downloaded, total };
    });

    let videoStream: internal.Readable;

    if (format === "mp4") {
      videoStream = ytdl(url, {
        quality: "highestvideo",
        filter: (format) =>
          format.qualityLabel === "1080p60" ||
          format.qualityLabel === "1080p" ||
          format.qualityLabel === "720p60" ||
          format.qualityLabel === "720p",
      }).on("progress", (_, downloaded: number, total: number) => {
        tracker.video = { ...tracker.video, downloaded, total };
      });
    }

    const tempFileName = `${__dirname}/temp-${interaction.id}`;
    const audio = ffmpeg(audioStream).format("mp3").output(`${tempFileName}.mp3`).withNoVideo();
    if (format === "mp3") audio.setStartTime(startSeconds).setDuration(endSeconds - startSeconds);

    audio
      .on("end", async () => {
        if (format === "mp3") {
          tracker.uploading = true;
          await interaction.editReply({
            files: [
              { attachment: `${tempFileName}.mp3`, name: `${vidInfo.videoDetails.title}.mp3` },
            ],
          });
          clearInterval(updateInterval);
          return fs.unlink(`${tempFileName}.mp3`, (err) => {
            if (err) throw err;
          });
        }

        ffmpeg()
          .addInput(videoStream)
          .videoCodec("copy")
          .outputOptions(["-map 0:v:0"])
          .withNoAudio()
          .on("end", () => {
            ffmpeg()
              .addInput(`${tempFileName}.mp4`)
              .addInput(`${tempFileName}.mp3`)
              .outputOptions(["-map 0:v:0", "-map 1:a:0"])
              //   .videoCodec("copy")
              .audioCodec("copy")
              .seek(startSeconds)
              .setDuration(endSeconds - startSeconds)
              .on("progress", ({ frames, currentFps, timemark }) => {
                const [hours, minutes, seconds] = timemark.split(":");
                tracker.merged = {
                  frame: frames,
                  fps: currentFps,
                  percentage:
                    parseFloat(
                      Duration.fromObject({
                        hours: parseInt(hours),
                        minutes: parseInt(minutes),
                        seconds: parseFloat(seconds),
                      }).toFormat("s")
                    ) /
                    (endSeconds - startSeconds),
                };
              })
              .on("end", async () => {
                fs.unlinkSync(`${tempFileName}.mp3`);
                fs.unlinkSync(`${tempFileName}.mp4`);

                tracker.uploading = true;
                await interaction
                  .editReply({
                    files: [
                      {
                        attachment: `${tempFileName}-full.mp4`,
                        name: `${vidInfo.videoDetails.title}.mp4`,
                      },
                    ],
                  })
                  .then(
                    () => {
                      fs.unlinkSync(`${tempFileName}-full.mp4`);
                    },
                    (e) => {
                      console.error(e);
                    }
                  );
                clearInterval(updateInterval);
              })
              .saveToFile(`${tempFileName}-full.mp4`);
          })
          .saveToFile(`${tempFileName}.mp4`);
      })
      .run();
  }
}

function parseTime(timeInput: string) {
  const time = timeInput.split(":");
  if (time.length > 3) throw new Error("too long");

  if (
    !time.every((digits) => {
      try {
        parseInt(digits);
        return true;
      } catch (e) {
        return false;
      }
    })
  ) {
    throw new Error("non digits");
  }

  return Duration.fromObject(
    time.length === 3
      ? { hours: parseInt(time[0]), minutes: parseInt(time[1]), seconds: parseFloat(time[2]) }
      : time.length === 2
        ? { minutes: parseInt(time[0]), seconds: parseFloat(time[1]) }
        : { seconds: parseFloat(timeInput) }
  ).as("seconds");
}
