const Discord = require('discord.js');
const agree = "✅";
const disagree = "❎";
exports.run = async function run(client, message, args) {
  let voted = message.mentions.users.first();

  let msg = await message.channel.send(`${voted} has been voted to be kicked; react with ✅ to agree to kick, ❎ to disagree`);
  let numA = 0;
  let numB = 0;
  
  const collector = msg.createReactionCollector(r => r.emoji.name == agree || r.emoji.name == disagree, {time: 60});
  collector.on('collect', r => {
      if(r.emoji.name == agree)
        numA++;
      else
        numB++;
  });
    
  await msg.react(agree);
  await msg.react(disagree);

  collector.on('end', r => {
    msg.delete();
    message.channel.send(`Voting Ended! Results:\n\n${agree}: **${r.get(agree).count - 1}**\n${disagree}: **${r.get(disagree).count - 1}**`)
    if(r.get(agree).count > r.get(disagree).count) {
      message.channel.send(`Sorry, ${voted}`);
      voted.kick();
    } else {
      message.channel.send(`${voted} will not be kicked!`);
    }
  });

}

exports.conf = {
  aliases: ['vk'],
  permLevel: 3
};

exports.help = {
  name: "votekick",
  description: "Votes to kick a user",
  usage: "~votekick *user*"
};