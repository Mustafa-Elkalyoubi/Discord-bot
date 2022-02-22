const { exec } = require("child_process");

exports.run = async (client, message, args) => {
  const outputErr = (message, stdData) => {
    let { stdout, stderr } = stdData;
    stderr = stderr
      ? [
          "`STDERR`",
          "```sh",
          client.clean(stderr.substring(0, 800)) || " ",
          "```",
        ]
      : [];
    stdout = stdout
      ? [
          "`STDOUT`",
          "```sh",
          client.clean(
            stdout.substring(0, stderr ? stderr.length : 2046 - 40)
          ) || " ",
          "```",
        ]
      : [];
    let msg = stdout.concat(stderr).join("\n").substring(0, 2000);
    message.edit(msg);
  };

  client.clean = (text) => {
    if (typeof text !== "string") text = inspect(text, { depth: 0 });
    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203))
      .replace(
        client.token,
        "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0"
      );
    return text;
  };

  const command = args.join(" ");
  const outMessage = await message.channel.send(`Running \`${command}\`...`);
  let stdOut = await doExec(command).catch((data) =>
    outputErr(outMessage, data)
  );
  stdOut = stdOut.substring(0, 1750);
  outMessage.edit(`\`OUTPUT\`
\`\`\`sh
${client.clean(stdOut)}
\`\`\``);
};

exports.conf = {
  aliases: [],
  permLevel: 4,
};

exports.help = {
  name: "exec",
  description: "Executes a console command.",
  usage: "exec [command]",
};

const doExec = (cmd, opts = {}) => {
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (err, stdout, stderr) => {
      if (err) return reject({ stdout, stderr });
      resolve(stdout);
    });
  });
};
