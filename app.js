const { Client, Collection, Intents } = require("discord.js");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
const settings = require("./settings.json");
tokensIsIncluded("./tokens.json") ? (tokens = require("./tokens.json")) : {};
const fs = require("fs");
const moment = require("moment");
require("./util/eventLoader")(client);

var config = JSON.parse(fs.readFileSync("./settings.json", "utf-8"));
const prefix = config.prefix;

const log = (message) => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
};

const talkedRecently = new Set();

client.commands = new Collection();
client.aliases = new Collection();
client.permLevels = new Collection();
client.mutes = require("./mutes.json");
client.lastReboot = require("./reboot.json");
client.afks = require("./afks.json");
client.last = require("./last.json");
client.reminders = require("./reminders.json");
client.champs = require("./champs.json");

fs.readdir("./commands/", (err, files) => {
  var n = 0;
  if (err) console.error(err);
  log(`Loading a total of ${files.length} commands.`);
  files.forEach((f) => {
    n++;
    let props = require(`./commands/${f}`);
    log(`Loading Command #${n}: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach((alias) => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = (command) => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];
      let cmd = require(`./commands/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach((alias) => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.on("messageCreate", (message) => {});

client.elevation = function (message) {
  let permlvl = 0;
  if (message.guild == null) return (permlvl = 0);
  /*
    let regular_role = message.guild.roles.find(x => x.id === `${settings.regrolename}`);
    if(regular_role && message.member.roles.has(regular_role.id)) permlvl = 1;
    let regular_role2 = message.guild.roles.find(x => x.id === `${settings.regrolename2}`);
    if(regular_role2 && message.member.roles.has(regular_role2.id)) permlvl = 1;
    let regular_role3 = message.guild.roles.find(x => x.id === `${settings.regrolename3}`);
    if(regular_role3 && message.member.roles.has(regular_role3.id)) permlvl = 1;
    let mod_role = message.guild.roles.find(x => x.id === `${settings.modid}`);
    */
  if (
    message.member.permissions.has("MANAGE_ROLES") &&
    message.member.permissions.has("MANAGE_CHANNELS") &&
    message.member.permissions.has("MANAGE_MESSAGES")
  )
    permlvl = 2;
  if (message.member.permissions.has("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === settings.ownerid) permlvl = 4;
  return permlvl;
};

client.on("error", (e) => {
  message.channel.send(`\`\`\`${e}\`\`\``);
  console.error(e);
});
client.on("warn", (e) => console.warn(e));

client.login(typeof tokens != "undefined" ? tokens.token : process.env.token);

function tokensIsIncluded(path) {
  try {
    require.resolve(path);
    return true;
  } catch (e) {
    return false;
  }
}
