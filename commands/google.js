const { MessageEmbed } = require("discord.js");
const google = require("googlethis");
exports.run = async function run(client, message, args, command) {
  const options = {
    page: 0,
    safe: true,
    additional_params: {
      hl: "en",
    },
  };

  const search = args.join(" ");
  if (search == "") return message.reply("??");
  const reply = await message.channel.send({
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: message.author.username,
          iconURL: message.author.displayAvatarURL(),
        })
        .setDescription("Please wait..."),
    ],
  });
  let response, result;

  var embed = new MessageEmbed()
    .setAuthor({
      name: message.author.username,
      iconURL: message.author.displayAvatarURL(),
    })
    .setTimestamp();

  try {
    if (command == "image" || command == "i") {
      response = await google.image(search, { safe: false });
      result = response[0];

      embed.setTitle("View Original").setImage(result.url).setURL(result.url);
    }

    if (command == "reverse") {
      response = await google.search(search, { ris: true });
      result = response.results;
      embed
        .setTitle("Go to link")
        .setURL(result[0].url)
        .setDescription(`Top result retrieved from ${result[0].url}`)
        .setImage(search);
    }

    if (command == "google" || command == "search") {
      response = await google.search(search, options);
      result = response.featured_snippet;
      if (result.title == "N/A") result = response.results[0];
      embed
        .setTitle(result.title)
        .setDescription(result.description)
        .setURL(result.url)
        .setThumbnail(results.favicons ? result.favicons.high_res : "");
    } else if (command == "person") {
      response = await google.search(search, options);
      result = response.knowledge_panel;
      embed
        .setTitle(result.title)
        .setDescription(result.description)
        .setURL(result.url != "N/A" ? result.url : "")
        .addFields(
          { name: "Born", value: `${result.born}`, inline: true },
          { name: "Height", value: `${result.height}`, inline: true },
          {
            name: "Nationality",
            value: `${result.nationality}`,
            inline: true,
          },
          { name: "Profession", value: `${result.type}`, inline: true }
        )
        .setImage(result.images[0].url);
    } else if (command == "translate") {
      response = await google.search(message.content.slice(1), options);
      if (response == undefined)
        return reply.edit({
          embeds: [
            new MessageEmbed.setDescription(
              "Bruh u tryna translate from English?"
            ),
          ],
        });
      result = response.translation;
      embed
        .setTitle("Translate")
        .addFields(
          { name: result.source_language, value: search },
          { name: result.target_language, value: result.target_text }
        );
    } else if (command == "dictionary" || command == "define") {
      response = await google.search(`define ${search}`, options);
      result = response.dictionary;
      embed.setTitle(result.word);
      embed.setDescription(result.definitions[0]);
      result.definitions.forEach(function (item, index) {
        if (index != 0) embed.addField(`Definition ${index + 1}`, item, false);
      });
      result.examples.forEach(function (item, index) {
        embed.addField(`Example ${index + 1}`, item, false);
      });
    }
    reply.edit({ embeds: [embed] });
  } catch (e) {
    log(e);
    log(result);
    if (result == undefined)
      return reply.edit({
        embeds: [new MessageEmbed().setDescription("No results gandu")],
      });
    reply.edit({
      embeds: [
        new MessageEmbed().setDescription("Error habben try again sir please"),
      ],
    });
  }
};

exports.conf = {
  aliases: [
    "search",
    "image",
    "i",
    "person",
    "translate",
    "reverse",
    "dictionary",
    "define",
  ],
  permLevel: 0,
};

exports.help = {
  name: "google",
  description: "search some shit my guy",
  usage: "",
};

const log = (input) => console.log(input);
