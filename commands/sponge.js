exports.run = async function run(client, message, args) {
  let newMsg = "";
  let rand = 0;
  let hasUpper;

  for (x in args) {
    let msg = args[x].split("");
    hasUpper = false;
    for (j in msg) {
      if (j + 1 == msg.length && hasUpper == false) {
        newMsg += msg[j].toUpperCase();
        hasUpper = true;
        continue;
      }

      if (rand >= 0.5) {
        newMsg += msg[j].toUpperCase();
        rand = 0;
        hasUpper = true;
      } else {
        newMsg += msg[j].toLowerCase();
        rand += Math.random();
      }
    }
    newMsg = newMsg + " ";
  }
  message.channel.send(newMsg);
};

exports.conf = {
  aliases: [],
  permLevel: 0,
};

exports.help = {
  name: "sponge",
  description: "",
  usage: "",
};
