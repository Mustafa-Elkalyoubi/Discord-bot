const jimp = require('jimp');
const fs = require('fs');
const Discord = require('discord.js');
exports.run = async (client, message, args) => {
  let n = 0;
  let ship1ID = args[n];
  let ship2ID = args[n+1];

  if(!ship1ID) {
    for(var i = 0; i <= args.length; i++) {
      n++;
      ship1ID = args[n];
      ship2ID = args[n+1];
      if(!ship1ID) {
        continue;
      }
      break;
    }
    if(!ship1ID) {
      return message.channel.send("You need to mention __**`at least 1 user`**__\n\n*Make sure there is only one space after the ship command*");
    }
  }

  if(!ship2ID) {
    for(var i = n; i <= args.length; i++) {
      n++;
      ship2ID = args[n+1];
      if(!ship2ID) {
        continue;
      }
      break;
    }
  }

  message.channel.startTyping();

  if(!ship2ID) {
    ship2ID = `<@${message.author.id}>`;

    let ship1 = client.users.find(x => x.id === (ship1ID.replace(/<|>|@|!/gi, function(x) {
      return x = "";
    })));
    let ship2 = client.users.find(x => x.id === (ship2ID.replace(/<|>|@|!/gi, function(x) {
      return x = "";
    })));

    let pic1 = ship1.avatarURL;
    let pic2 = ship2.avatarURL;
    if(!pic1) pic1 = ship2.defaultAvatarURL;
    if(!pic2) pic2 = ship1.defaultAvatarURL;
    // let heartpic = 'http://www.clker.com/cliparts/v/I/8/S/I/p/red-with-red-heart-hi.png';
    let heartpic = './test.png';
    let canvas = './canvas.png';

    var images = [canvas, pic1, heartpic, pic2];
    var jimps = [];

    for(var i = 0; i < images.length; i++) {
      jimps.push(jimp.read(images[i]));
    }

    Promise.all(jimps).then(function(data) {
      message.channel.stopTyping();
      return Promise.all(jimps);
    }).then(function(data) {
      data[1].resize(150, 150);
      data[2].resize(150, 150);
      data[3].resize(150, 150);
      data[0].composite(data[3], 0, 0);
      data[0].composite(data[2], 150, 0);
      data[0].composite(data[1], 300, 0);
      data[0].write('ship.jpg', function() {
        let shipname = (ship2.username.slice(0, Math.floor(ship2.username.length / 2)) + (ship1.username.slice(Math.floor(ship1.username.length / 2), Math.floor(ship1.username.length))));
        message.channel.send(`Shipping: **${ship2.username}** x **${ship1.username}**\n\nShip Name: :heart: **${shipname}** :heart:`, {file: './ship.jpg'});
        });
    });

    message.channel.stopTyping();

    return;
  }

  let ship1 = client.users.find(x => x.id === (ship1ID.replace(/<|>|@|!/gi, function(x) {
    return x = "";
  })));
  let ship2 = client.users.find(x => x.id === (ship2ID.replace(/<|>|@|!/gi, function(x) {
    return x = "";
  })));

  
  if(ship2.username === ship1.username) ship2 = message.author;

  let pic1 = ship2.avatarURL;
  let pic2 = ship1.avatarURL;
  if(!pic1) pic1 = ship1.defaultAvatarURL;
  if(!pic2) pic2 = ship2.defaultAvatarURL;
  // let heartpic = 'http://www.clker.com/cliparts/v/I/8/S/I/p/red-with-red-heart-hi.png';
  let heartpic = './test.png';
  let canvas = './canvas.png';

  var images = [canvas, pic1, heartpic, pic2];
  var jimps = [];

  for(var i = 0; i < images.length; i++) {
    jimps.push(jimp.read(images[i]));
  }

  Promise.all(jimps).then(function(data) {
    return Promise.all(jimps);
    message.channel.stopTyping();
  }).then(function(data) {
    data[1].resize(150, 150);
    data[2].resize(150, 150);
    data[3].resize(150, 150);
    data[0].composite(data[3], 0, 0);
    data[0].composite(data[2], 150, 0);
    data[0].composite(data[1], 300, 0);
    data[0].write('ship.jpg', function() {
      let shipname = (ship1.username.slice(0, Math.floor(ship1.username.length / 2)) + (ship2.username.slice(Math.floor(ship2.username.length / 2), Math.floor(ship2.username.length))));
      message.channel.send(`Shipping: **${ship1.username}** x **${ship2.username}**\n\nShip Name: :heart: **${shipname}** :heart:`, {file: './ship.jpg'});
      }, function() {
      fs.unlink('./ship.jpg');
    });
  });

  message.channel.stopTyping();
};

exports.conf = {
  aliases: [],
  permLevel: 0
};

exports.help = {
  name: "ship",
  description: "Ships 2 users",
  usage: "ship *mention1* *mention2 (optional)*"
};