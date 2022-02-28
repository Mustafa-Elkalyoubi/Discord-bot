const axios = require("axios");
const { DiscordAPIError, MessageEmbed } = require("discord.js");

exports.run = async function run(client, message, args) {
  const requestURL = `https://euw.whatismymmr.com/api/v1/summoner?name=${encodeURI(
    args.join(" ")
  )}`;

  if (args.length == 0) return message.reply("Put a name dumbass");
  if (Date.now() - globalThis.lastRunTime >= 60000) {
    globalThis.mmrLimiter = 0;
    globalThis.lastRunTime = Date.now();
  }
  if (globalThis.mmrLimiter == 59)
    return message.reply("Rate limit reached, please wait 1 minute");
  console.log(globalThis.mmrLimiter);
  axios
    .get(requestURL)
    .then((res) => {
      globalThis.mmrLimiter += 1;
      const data = res.data;
      const embed = new MessageEmbed()
        .setColor("#0099ff")
        .setAuthor({
          name: `${message.author.username}`,
          iconURL: `${message.author.displayAvatarURL()}`,
          url: `${requestURL}`,
        })
        .addFields(
          { name: "\u200B", value: "\u200B" },
          { name: "Ranked Solo MMR", value: `${data.ranked.avg}` },
          {
            name: "Closest Rank",
            value: `${data.ranked.closestRank}`,
            inline: true,
          },
          {
            name: "Percentile",
            value: !data.ranked.percentile
              ? `Top ${100 - data.ranked.percentile}%`
              : "null",
            inline: true,
          },
          { name: "ARAM MMR", value: `${data.ARAM.avg}` },

          {
            name: "Closest Rank",
            value: `${data.ARAM.closestRank}`,
            inline: true,
          },
          {
            name: "Percentile",
            value:
              data.ranked.percentile == null
                ? `Top ${100 - data.ARAM.percentile}%`
                : "null",
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({
          text: "Data Retrieved from https://euw.whatismymmr.com",
          iconURL:
            "https://static.wikia.nocookie.net/leagueoflegends/images/0/07/League_of_Legends_icon.png/revision/latest?cb=20191018194326",
        });

      message.reply({ embeds: [embed] });
    })
    .catch((error) => {
      console.log(`Probably the right error lol`);
      message.reply(`Play more games idoit`);
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
