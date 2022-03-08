const fs = require("fs");
exports.run = async function run(client, message, args) {
  let time = args[0];
  var today = new Date();

  if (message.content.includes("delete")) {
    let number = parseInt(args[1]);
    var n = 0;
    for (let i in client.reminders) {
      if (client.reminders[i].user.id == message.author.id) {
        n += 1;
        if (n == number) {
          delete client.reminders[i];
          return message.channel.send(`Reminder ${n} deleted`);
        }
      }
    }
    return message.channel.send(`Reminder ${n} doesn't exist`);
  }

  if (message.content.includes("reminders")) {
    let remindermsg = "";
    var n = 0;
    for (let i in client.reminders) {
      if (client.reminders[i].user.id == message.author.id) {
        n += 1;
        remindermsg += `${n}| **Time left**: <t:${Math.floor(
          client.reminders[i].time / 1000
        )}:R> | **Description**: ${client.reminders[i].description}\n`;
      }
    }
    if (remindermsg == "")
      return message.channel.send("You haven't set any reminders");
    return message.channel.send(remindermsg);
  }

  if (args[0].includes(":")) {
    newTime = args[0].split(":");
    var timeToRemind =
      Date.now() -
      4 * 60 * 60 * 1000 +
      (newTime[0] - today.getHours()) * 3600000 +
      43200000 +
      (newTime[1] - today.getMinutes()) * 60000;
  } else if (
    args[0].includes("th") ||
    args[0].includes("st") ||
    args[0].includes("nd") ||
    args[0].includes("rd")
  ) {
    var timeToRemind = today.setDate(args[0].slice(0, -2));
  } else if (args[0].includes("m")) {
    var timeToRemind = Date.now() + parseInt(args[0].slice(0, -1)) * 60000;
  } else if (args[0].includes("d")) {
    var timeToRemind =
      Date.now() + parseInt(args[0].slice(0, -1)) * 60000 * 1440;
  } else {
    if (args[0].includes("h")) time = args[0].slice(0, -1);
    var timeToRemind = Date.now() + time * 1000 * 60 * 60;
  }

  if (isNaN(timeToRemind)) return message.channel.send("Error setting date");

  description = args.slice(1).join(" ");

  console.log(
    `Reminding ${message.author} :t${
      (timeToRemind - Date.now()) / 3600000
    }: ${description}`
  );

  client.reminders[parseInt(Date.now()) + parseInt(message.author.id)] = {
    time: timeToRemind,
    description: description,
    channel: message.channel.id,
    user: message.author,
  };

  timeLeft = (timeToRemind - Date.now()) / 3600000;
  if (timeLeft > 24) timeLeft = (timeLeft / 24).toFixed(2) + " days";
  else if (timeLeft > 1) timeLeft = timeLeft.toFixed(2) + " hours";
  else timeLeft = (timeLeft * 60).toFixed(2) + " minutes";
  message.reply(
    `reminder saved! Will remind you <t:${Math.floor(
      timeToRemind / 1000
    )}:R>: ${description}`
  );
};

exports.conf = {
  aliases: ["remindme", "remind", "reminders", "checkreminders"],
  permLevel: 0,
};

exports.help = {
  name: "reminder",
  description: "remind in time",
  usage:
    '~remind [Time in formats {hour:minute, "1st, 2nd, 3rd, 4th, 5th, etc", nm for n minutes, nd for n days}] [Description] || To delete: remind delete n',
};
