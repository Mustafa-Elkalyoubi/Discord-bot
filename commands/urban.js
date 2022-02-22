const Discord = require("discord.js");
const urban = require("relevant-urban");
exports.run = function run(client, message, args) {
  if (args.length < 1)
    return message.channel.send(`Need something to search..`);
  let msg = args.join(" ");

  urban(msg).then((json) => {
    if (!json) return message.channel.send(`No results found for: **${msg}**`);

    var embed = new Discord.MessageEmbed()
      .setTitle(json.word)
      .setURL(json.urbanURL || "")
      .setDescription(json.definition.replace(/]|\[/gi, "") || "None")
      .addField("Example", `${json.example.replace(/]|\[/gi, "")}`)
      .addField("👍 Upvotes", `${json.thumbsUp || "0"}`, true)
      .addField("👎 Downvotes", `${json.thumbsDown || "0"}`, true)
      .setFooter(`Written by: ${json.author || "None"}`);

    message.channel.send({ embeds: [embed] });
  });
};

exports.conf = {
  aliases: ["ud"],
  permLevel: 0,
};

exports.help = {
  name: "urban",
  description: "Searches Urban Dictionary",
  usage: "~urban search",
};
