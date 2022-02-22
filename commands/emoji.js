exports.run = async (client, message) => {
  let args = message.content.split(" ").slice(1).join(" ");
  function emojify(str) {
    if (typeof str === "string") {
      return Array.prototype.map
        .call(str, (e, i, a) => {
          if (/[a-zA-Z]/.test(e)) {
            return ":regional_indicator_" + e.toLowerCase() + ":";
          } else if (/[ ]/.test(e)) {
            return "  ";
          } else if (/[?]/.test(e)) {
            return ":question:";
          } else if (/[!]/.test(e)) {
            return `:exclamation:`;
          } else {
            return e;
          }
        })
        .join("\u200C");
    } else {
      throw new TypeError("argument is not a string");
    }
  }

  await message.channel.send(emojify(args));
};

exports.conf = {
  aliases: [],
  permLevel: 0,
};

exports.help = {
  name: "emoji",
  description: "Words to emoji",
  usage: "emoji *whatever*",
};
