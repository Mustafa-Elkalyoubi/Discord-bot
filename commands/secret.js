  const Discord = require('discord.js');
  exports.run = async (client, message) => {
    try {
      role = await message.guild.roles.create({
        data: {
          name: " ︀︀︀︀",
          color: "0x2f3136",
          hoist: false,
        }
      }); 
    } catch(e) {
      console.log(e.stack);
    }
    message.member.roles.add(role);
  };
  
  exports.conf = {
    aliases: ['s'],
    permLevel: 4
  };
  
  
  exports.help = {
    name: "secret",
    description: "Only for mr cookie",
    usage: "secret"
  };