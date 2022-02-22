const ms = require("ms");
exports.run = (client, message, args) => {
  if (message.content.includes("all")) {
    message.guild.channels.cache.forEach(function (channel) {
      if (channel.type == "voice") return;
      if (!channel.isText()) return;
      if (!client.lockit) client.lockit = [];
      var time = args.join("").replace("all", "");
      let validUnlocks = ["release", "unlock", "lift"];
      if (!time)
        return message.reply(
          "You must set a duration for the lockdown in either hours, minutes or seconds"
        );
      if (validUnlocks.includes(time)) {
        channel
          .overwritePermissions([
            {
              id: message.guild.id,
              type: ["SEND_MESSAGES"],
            },
          ])
          .then(() => {
            client.channels.cache.get(`${channel.id}`).send("Lockdown lifted.");
            clearTimeout(client.lockit[channel.id]);
            delete client.lockit[channel.id];
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        channel
          .overwritePermissions([
            {
              id: message.guild.id,
              deny: ["SEND_MESSAGES"],
            },
          ])
          .then(() => {
            channel
              .send(
                `All channels locked down for ${ms(ms(time), { long: true })}`
              )
              .then(() => {
                client.lockit[channel.id] = setTimeout(() => {
                  channel
                    .overwritePermissions([
                      {
                        id: message.guild.id,
                        type: ["SEND_MESSAGES"],
                      },
                    ])
                    .then(channel.send("Lockdown lifted."))
                    .catch(console.error);
                  delete client.lockit[channel.id];
                }, ms(time));
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
    return;
  }

  if (!client.lockit) client.lockit = [];
  var time = args.join(" ");
  let validUnlocks = ["release", "unlock", "lift"];
  if (!time)
    return message.reply(
      "You must set a duration for the lockdown in either hours, minutes or seconds"
    );

  if (validUnlocks.includes(time)) {
    message.channel
      .overwritePermissions([
        {
          id: message.guild.id,
          type: ["SEND_MESSAGES"],
        },
      ])
      .then(() => {
        message.channel.send("Lockdown lifted.");
        clearTimeout(client.lockit[message.channel.id]);
        delete client.lockit[message.channel.id];
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    message.channel
      .overwritePermissions([
        {
          id: message.guild.id,
          deny: ["SEND_MESSAGES"],
        },
      ])
      .then(() => {
        message.channel
          .send(`Channel locked down for ${ms(ms(time), { long: true })}`)
          .then(() => {
            client.lockit[message.channel.id] = setTimeout(() => {
              message.channel
                .overwritePermissions([
                  {
                    id: message.guild.id,
                    type: ["SEND_MESSAGES"],
                  },
                ])
                .then(message.channel.send("Lockdown lifted."))
                .catch(console.error);
              delete client.lockit[message.channel.id];
            }, ms(time));
          })
          .catch((error) => {
            console.log(error);
          });
      });
  }
};
exports.conf = {
  aliases: ["ld"],
  permLevel: 2,
};

exports.help = {
  name: "lockdown",
  description:
    "This will lock a channel down for the set duration, be it in hours, minutes or seconds.",
  usage: "lockdown <duration>",
};
