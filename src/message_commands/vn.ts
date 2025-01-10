import axios from "axios";
import { Message } from "discord.js";
import fs from "node:fs";
import path from "node:path";

const channelID = "622767050359701516";
const iDontCare =
  "acU6Va9UcSVZzsVw7IU/80s0Kh/pbrTcwmpR9da4mvQejIMykkgo9F2FfeCd235K/atHZtSAmxKeTUgKxAdNVO8PAoZq1cHNQXT/PHthL2sfPZGSdxNgLH0AuJwVeI7QZJ02ke40+HkUcBoDdqGDZeUvPqoIRbE23Kr+sexYYe4dVq+zyCe3ci/6zkMWbVBpCjq8D8ZZEFo/lmPJTkgjwqnqHuf6XT4mJyLNphQjvFH9aRqIZpPoQz1sGwAY2vssQ5mTy5J5muGo+n82b0xFROZwsJpumDsFi4Da/85uWS/YzjY5BdxGac8rgUqm9IKh7E6GHzOGOy0LQIz3O4ntTg==";

const __dirname = (() => {
  const x = path.dirname(decodeURI(new URL(import.meta.url).pathname));
  return path.resolve(process.platform == "win32" ? x.substr(1) : x);
})();

const run = async (message: Message, args: string[]) => {
  const filePath = path.join(__dirname, "input.ogg");
  const file = fs.readFileSync(filePath);

  const fileDuration = await getFileDuration(file);

  const { uploadURL, filename } = await getURL(file);
  await axios.put(uploadURL, file, {
    headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
  });

  const body = {
    flags: 8192,
    attachments: [
      {
        id: "0",
        filename: filename,
        uploaded_filename: filename,
        duration_secs: fileDuration,
        waveform: iDontCare,
      },
    ],
  };

  await axios.post(`https://discord.com/api/v10/channels/${channelID}/messages`, body, {
    headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` },
  });
};

async function getURL(file: Buffer) {
  const fileSize = Buffer.byteLength(file);

  const body = {
    files: [
      {
        filename: "voice-msg.ogg",
        file_size: fileSize,
        id: "2",
      },
    ],
  };

  type response = {
    attachments: [
      {
        id: number;
        upload_url: string;
        upload_filename: string;
      }
    ];
  };

  const res = await axios.post<response>(
    `https://discord.com/api/v10/channels/${channelID}/attachments`,
    body,
    {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      },
    }
  );

  return {
    filename: res.data.attachments[0].upload_filename,
    uploadURL: res.data.attachments[0].upload_url,
  };
}

async function getFileDuration(buffer: Buffer) {
  const header = Buffer.from("mvhd");

  const start = buffer.indexOf(header) + 17;
  const timeScale = buffer.readUInt32BE(start);
  const duration = buffer.readUInt32BE(start + 4);

  const audioLength = Math.floor((duration / timeScale) * 1000) / 1000;

  return audioLength;
}

const conf = {
  aliases: [],
  permLevel: 4,
};

const help = {
  name: "vn",
  description: "voice note waow",
  usage: "vn",
};

export default { run, conf, help };
