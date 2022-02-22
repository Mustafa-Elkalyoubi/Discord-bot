const deepai = require("deepai");
exports.run = async function run(client, message, args) {
  message.channel.sendTyping();
  try {
    deepai.setApiKey("9db9323b-77d2-434e-b6db-813de7158dc5");
    response = await getText(args.join(" "));
    message.channel.send(response);
  } catch (e) {
    console.log(e.stack);
    message.channel.send("Error");
  }
};

exports.conf = {
  aliases: ["deepAI", "deep", "ai", "generate"],
  permLevel: 0,
};

exports.help = {
  name: "deepai",
  description: "deepAI Text generation",
  usage: "~deepai ass tits fuck",
};

async function getText(input) {
  var resp = await deepai.callStandardApi("text-generator", {
    text: input,
  });
  console.log(resp);
  return resp.output;
}
