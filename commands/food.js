const Discord = require("discord.js");
exports.run = async (client, message, args) => {
  let food = [
    "https://media.giphy.com/media/2LqQkIPKNevkc/giphy.gif",
    "https://media.giphy.com/media/XCVm7xxtEolwc/giphy.gif",
    "https://media.giphy.com/media/gw3NpMPvrN64YrC0/giphy.gif",
    "https://media.giphy.com/media/DRjVYJVyPZU5y/giphy.gif",
    "http://www.gifmania.co.uk/Food-Animated-Gifs/Animated-Confectionery/Cookies/Chocolate-Chip-Cookies/Cookie-Freshly-Made-70479.gif",
    "http://www.gifmania.co.uk/Food-Animated-Gifs/Animated-Confectionery/Cookies/Chocolate-Chip-Cookies/Cookie-Freshly-Made-70479.gif",
    "http://recentlyheard.com/wp-content/uploads/2015/06/tumblr_m5rae8HnQp1rtmqxqo1_500.gif",
    "https://cdn.discordapp.com/attachments/359382908366094336/359392526127464448/pizza.gif",
    "https://i.imgur.com/y5FGtzY.gif",
    "http://68.media.tumblr.com/c98cbac2f97ce50a24470b7ff2e5dceb/tumblr_o2303oZvx61udh5n8o1_500.gif",
    "https://media.giphy.com/media/kWEwk57Tz6jXa/giphy.gif",
    "https://media.giphy.com/media/uigmJxUv4s3AY/giphy.gif",
    "https://media.giphy.com/media/64RX5GZFCfE1q/giphy.gif",
    "https://media.giphy.com/media/QM6B6m80wloOI/giphy.gif",
    "http://25.media.tumblr.com/tumblr_m13x73wABn1r6uhj2o1_500.gif",
    "https://49.media.tumblr.com/598933cbd243859c572b4b6431cae3ad/tumblr_nzi4h9Aw4N1u9ooogo1_500.gif",
    "https://38.media.tumblr.com/654e5006ca045e852d507610f13b5ad8/tumblr_n90z8xWc4i1rwtsdlo1_500.gif",
  ];
  let foods = new Map([
    [
      "pizza",
      "https://cdn.discordapp.com/attachments/359382908366094336/359392526127464448/pizza.gif",
    ],
    ["pancakes", "https://media.giphy.com/media/XCVm7xxtEolwc/giphy.gif"],
    ["steak", "https://media.giphy.com/media/gw3NpMPvrN64YrC0/giphy.gif"],
    ["smores", "https://media.giphy.com/media/DRjVYJVyPZU5y/giphy.gif"],
    [
      "cookies",
      "http://www.gifmania.co.uk/Food-Animated-Gifs/Animated-Confectionery/Cookies/Chocolate-Chip-Cookies/Cookie-Freshly-Made-70479.gif",
    ],
    [
      "cookie",
      "http://www.gifmania.co.uk/Food-Animated-Gifs/Animated-Confectionery/Cookies/Chocolate-Chip-Cookies/Cookie-Freshly-Made-70479.gif",
    ],
    ["chocolate", "https://media.giphy.com/media/kWEwk57Tz6jXa/giphy.gif"],
  ]);

  let randomColor = "0x" + ((Math.random() * 0xffffff) << 0).toString(16);

  let needed = message.content.slice(1);
  if (foods.has(needed)) {
    var embed = new Discord.RichEmbed()
      .setColor(randomColor)
      .setTimestamp()
      .setImage(foods.get(needed))
      .setDescription(`Foooood glorious fooooooood`);
    await message.channel.send({ embed }).then(message.channel.stopTyping());
    message.channel.stopTyping();
    return;
  }
  var embed = new Discord.RichEmbed()
    .setColor(randomColor)
    .setTimestamp()
    .setImage(food[Math.floor(Math.random() * food.length)])
    .setDescription("Fooooood glorious foooooood");
  await message.channel.send({ embed }).then(message.channel.stopTyping());
  message.channel.stopTyping();
};

exports.conf = {
  aliases: [
    "yum",
    "fud",
    "pizza",
    "pancakes",
    "hungry",
    "smores",
    "steak",
    "cookie",
    "cookies",
    "chocolate",
  ],
  permLevel: 0,
};

exports.help = {
  name: "food",
  description: "Yummy food :>",
  usage: "food",
};
