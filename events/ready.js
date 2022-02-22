const moment = require("moment");
const fs = require("fs");
module.exports = async (client) => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Connected`);

  client.commandNames = require("../commandNames.json");

  client.user.setActivity("~help", { type: 0 });

  fs.readdir("./commands/", (err, files) => {
    if (err) throw err;
    files.forEach((f) => {
      let props = require(`../commands/${f}`);
      let det;
      if (!client.commandNames[props.help.name]) {
        client.commandNames[props.help.name] = {
          enabled: true,
          guildOnly: true,
        };
        fs.writeFile(
          "./commandNames.json",
          JSON.stringify(client.commandNames, null, 4),
          (err) => {
            if (err) throw err;
          }
        );
      }
    });
  });

  if (client.lastReboot.reboot == true) {
    client.channels
      .fetch(`${client.lastReboot.channel}`)
      .then((channel) => channel.send("Reboot complete!"))
      .catch(console.error);
    client.lastReboot.reboot = false;
    fs.writeFileSync(
      "./reboot.json",
      JSON.stringify(client.lastReboot),
      (err) => {
        if (err) throw err;
      }
    );
  }

  let whoAreThese = [
    "290256656850354177",
    "145568089491243008",
    "209667763067682816",
    "249972446734712842",
    "195994587758723072",
    "170922771272957953",
  ];
  let roleName = "These are ziad's friends";

  setInterval(async function () {
    for (let i in whoAreThese) {
      let guildID = "622767050359701514";
      let bofi = client.guilds.cache.get(guildID);
      let role;
      role = await bofi.roles.cache.find((role) => role.name === roleName);
      if (!role) {
        role = await bofi.roles.create({
          name: roleName,
          color: "#797979",
        });
      }
      for (let i in whoAreThese) {
        who = await bofi.members.fetch(whoAreThese[i]);
        who.roles.add(role).catch((e) => {
          console.log(e);
          roleName = "Bruh who tf is this";
        });
      }
    }

    for (let i in client.mutes) {
      let time = client.mutes[i].time;
      let guild = client.guilds.cache.get(`${client.mutes[i].guild}`);
      let channelID = client.mutes[i].channel;
      let channel = client.channels.cache.get(`${channelID}`);
      let member = client.mutes[i].member;
      let mutedRole = guild.roles.cache.find((r) => r.name === "Muted");
      if (!mutedRole) continue;

      if (Date.now() > time) {
        if (time == 0) continue;
        try {
          member.roles.remove(mutedRole);
          delete client.mutes[i];
          channel.send(`${member.user} has been unmuted`);
          fs.writeFileSync(
            "./mutes.json",
            JSON.stringify(client.mutes, null, 4),
            (err) => {
              if (err) throw err;
            }
          );
          console.log(`${member.user} is no longer muted`);
        } catch (e) {
          console.log(e.stack);
        }
      }
    }

    for (let i in client.reminders) {
      let time = client.reminders[i].time;
      let channelID = client.reminders[i].channel;
      client.channels.fetch(channelID).then((channel) => {
        if (Date.now() > time) {
          try {
            channel.send(
              `<@!${client.reminders[i].user.id}>: ${client.reminders[i].description}`
            );
            delete client.reminders[i];
            fs.writeFileSync(
              "./reminders.json",
              JSON.stringify(client.reminders, null, 4),
              (err) => {
                if (err) throw err;
              }
            );
          } catch (e) {
            console.log(e.stack);
          }
        }
      });
    }
  }, 5000);
};
