exports.run = async function run(client, message, args) {
  let feet = args[0];
  let inches = args[1];
  message.channel.send(
    `${feet} foot and ${inches} inches is ${
      parseInt(inches) * 2.54 + parseInt(feet) * 12 * 2.54
    } cm`
  );
};

exports.conf = {
  aliases: [],
  permLevel: 0,
};

exports.help = {
  name: "tocm",
  description: "converts from feet and inches to cm",
  usage: "tocm *feet* *inches*",
};
