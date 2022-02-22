exports.run = async (client, message, args) => {
    message.channel.send("Cleaning");
    await message.channel.messages.forEach(function(element) {
        setTimeout(function() {
            console.log(element.author + " " + element.content + " " + element.createdTimeStamp);
            element.delete();
        }, 5000);
    });
};

exports.conf = {
  aliases: [],
  permLevel: 4
};


exports.help = {
  name: "destroy",
  description: "Empties a channel",
  usage: "~destroy"
};