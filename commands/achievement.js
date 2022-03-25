const snekfetch = require("snekfetch");
exports.run = (client, message, args) => {
  let [title, contents] = args.join(" ").split(" | ");
  if (!contents) {
    [title, contents] = ["Achievement Get!", title];
  }
  let rnd = Math.floor(Math.random() * 39 + 1);
  if (args.join(" ").toLowerCase().includes("burn")) rnd = 38;
  if (args.join(" ").toLowerCase().includes("cookie")) rnd = 7;
  if (args.join(" ").toLowerCase().includes("cake")) rnd = 10;
  if (args.join(" ").toLowerCase().includes("bed")) rnd = 9;
  if (args.join(" ").toLowerCase().includes("pig")) rnd = 5;
  if (args.join(" ").toLowerCase().includes("rules")) rnd = 2;

  if (title.length > 22 || contents.length > 22)
    return message.channel.send("Max Length: 22 Characters");
  const url = `https://www.minecraftskinstealer.com/achievement/a.php?i=${rnd}&h=${encodeURIComponent(
    title
  )}&t=${encodeURIComponent(contents)}`;
  snekfetch.get(url).then((r) => {
    message.channel.send({ files: [{ attachment: r.body }] });
  });
};

exports.conf = {
  aliases: ["mca"],
  permlevel: 0,
};

exports.help = {
  name: "achievement",
  description: "Send a Minecraft Achievement image to the channel",
  usage:
    "achievement Title|Text (/achievement Achievement Get|Used a Command!)",
};
