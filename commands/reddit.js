const Discord = require("discord.js");
const moment = require("moment");
const reddit = require("redwrap");
exports.run = async (client, message) => {
  let args = message.content.split(" ").slice(1).join(" ");
  if (!args)
    return await message.channel.send("You need to specify a subreddit.");

  reddit
    .r(`${args}`)
    .from("all")
    .limit(100, function (err, data, res) {
      if (typeof data.error !== "undefined") {
        if (data.error.toString() === "404")
          return message.channel.send(`Could not find subreddit: **${args}**`);
        if (data.error.toString() === "403")
          return message.channel.send("Subreddit **" + args + "** is private");
      }

      var redditRandom = Math.floor(Math.random() * data.data.children.length);
      if (redditRandom === "0") redditRandom + 1;

      if (typeof data === "undefined")
        return message.channel.send(
          "Error: Couldn't find subreddit: **" + args + "**"
        );
      if (typeof data.data === "undefined")
        return message.channel.send(
          "Error: Couldn't find subreddit: **" + args + "**"
        );
      if (typeof data.data.children[redditRandom] === "undefined")
        return message.channel.send(
          "Error: Couldn't find subreddit: **" + args + "**"
        );

      var pic = message.author.avatarURL;
      if (!pic) pic = message.author.defaultAvatarURL;
      let randomColor = "0x" + ((Math.random() * 0xffffff) << 0).toString(16);
      var date = moment().format("DD/MM/YYYY");
      message.channel.send(
        `__Post **${redditRandom}** of **${
          data.data.children.length - 1
        }**__ \`\`${data.data.children[redditRandom].data.title}\`\` \n\n__**${
          data.data.children[redditRandom].data.selftext
        }**__\n\n${data.data.children[redditRandom].data.url}`
      );
      return;
    });
};

exports.conf = {
  aliases: ["red"],
  permLevel: 0,
};

exports.help = {
  name: "reddit",
  description: "Searchs a subreddit for a random post",
  usage: "reddit **subreddit name**",
};
