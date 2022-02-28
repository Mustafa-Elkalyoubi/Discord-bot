const axios = require("axios");
const { DiscordAPIError, MessageEmbed } = require("discord.js");

exports.run = async function run(client, message, args) {
  const requestURL = `https://euw.whatismymmr.com/api/v1/summoner?name=${encodeURI(
    args.join(" ")
  )}`;

  if (args.length == 0) return message.reply("Put a name dumbass");
  if (Date.now() - globalThis.mmrLimiter[1] >= 60000) {
    globalThis.mmrLimiter = [0, Date.now()];
  }
  if (globalThis.mmrLimiter[0] == 59)
    return message.reply("Rate limit reached, please wait 1 minute");
  console.log(globalThis.mmrLimiter);
  axios
    .get(requestURL)
    .then((res) => {
      globalThis.mmrLimiter[0] += 1;
      console.log(res.status);
      if (res.status === 100) return message.reply("Who that lol");
      const data = res.data;
      const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`,
          url: `${requestURL}`,
        })
        .setTimestamp()
        .setFooter({
          text: "Data Retrieved from https://euw.whatismymmr.com",
          iconURL:
            "https://static.wikia.nocookie.net/leagueoflegends/images/0/07/League_of_Legends_icon.png/revision/latest?cb=20191018194326",
        });

      data.ranked.avg != null
        ? embed.addFields(
            ...Object.values(embedBuilder(data.ranked, "Ranked Solo MMR"))
          )
        : embed.addField("Ranked", "Not enough games");
      data.normal.avg != null
        ? embed.addFields(
            ...Object.values(embedBuilder(data.normal, "Normal MMR"))
          )
        : embed.addField("Normal", "Not enough games");
      data.ARAM.avg != null
        ? embed.addFields(...Object.values(embedBuilder(data.ARAM, "ARAM MMR")))
        : embed.addField("ARAM", "Not enough games");
      message.reply({ embeds: [embed] });
    })
    .catch((error) => {
      if (error.response.data.error.code == 101)
        return message.reply("Play more games idoit");
      if (error.response.data.error.code == 100)
        return message.reply("Who that lol");
      console.error(error.response.data);
    });
};

exports.conf = {
  aliases: ["mmr"],
  permLevel: 0,
};

exports.help = {
  name: "MMR",
  description: "Get a summoner's MMR for ARAM and Ranked Solo",
  usage: "~MMR [Summoner Name]",
};

function embedBuilder(context, title) {
  let fieldTitle = { name: `${title}`, value: `${context.avg}` };
  let fieldRank = {
    name: "Closest Rank",
    value: `${context.closestRank}`,
    inline: true,
  };
  let fieldPerc = {
    name: "Percentile",
    value: `Top ${100 - context.percentile}%`,
    inline: true,
  };
  return { fieldTitle, fieldRank, fieldPerc };
}
