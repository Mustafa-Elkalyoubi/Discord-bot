const { MessageActionRow, MessageButton } = require("discord.js");
exports.run = async function run(client, message, args) {
  const whenorwho = message.content.split(" ")[0].slice(1);
  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setLabel(whenorwho)
      .setStyle("LINK")
      .setURL(
        whenorwho == "who"
          ? `https://www.youtube.com/watch?v=u8gQeFYlTqI`
          : `https://www.google.com/whenIAsked`
      )
  );
  await message.reply({
    content: `Click here to find out ${whenorwho} ${
      whenorwho == "when" ? `${message.author}` + " asked" : "cares"
    }`,
    ephemeral: true,
    components: [row],
  });
};

exports.conf = {
  aliases: ["who"],
  permLevel: 0,
};

exports.help = {
  name: "when",
  description: "when did i ask",
  usage: "when/who",
};
