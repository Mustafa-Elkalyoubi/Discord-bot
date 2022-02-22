const fs = require("fs");
// const async = require('async');
const request = require("request");
const Discord = require("discord.js");
var config = JSON.parse(fs.readFileSync("./settings.json", "utf-8"));
const api = config.league_api_key;
exports.run = async function run(client, message, args) {
  var data = {};
  var s_toSearch = "";
  s_toSearch = args.join(" ").toLowerCase();
  var URL;
  message.channel.startTyping();
  let randomColor = "0x" + ((Math.random() * 0xffffff) << 0).toString(16);

  if (message.content.toLowerCase().startsWith("~requestchamps")) {
    async.waterfall(
      [
        function (callback) {
          request(
            `https://ddragon.leagueoflegends.com/realms/euw.json`,
            function (err, response, body) {
              if (!err) {
                var json = JSON.parse(body);
                data.dDragon = json.n.champion;
                console.log(json);
                callback(null, data);
              } else {
                console.log(`Response code: ${response.statusCode}`);
                console.log(`Error: ${err}`);
              }
            }
          );
        },
        function (data, callback) {
          request(
            `http://ddragon.leagueoflegends.com/cdn/${data.dDragon}/data/en_US/champion.json`,
            function (err, response, body) {
              if (!err) {
                var json = JSON.parse(body);
                data.champions = json.data;
                callback(null, data);
              } else {
                console.log(`Response code: ${response.statusCode}`);
                console.log(`Error: ${err}`);
              }
            }
          );
        },
      ],
      function (err, data) {
        if (err) return console.log(data);
        client.champs = data.champions;
        fs.writeFile(
          "./champs.json",
          JSON.stringify(client.champs, null, 4),
          (err) => {
            if (err) throw err;
          }
        );
        message.channel.send(`Champions Updated`);
      }
    );
  }

  if (!s_toSearch) return message.reply("name a summoner");

  if (message.content.toLowerCase().startsWith("~summoner")) {
    async.waterfall(
      [
        function (callback) {
          URL = `https://euw1.api.riotgames.com/lol/summoner/v3/summoners/by-name/${s_toSearch}?api_key=${api}`;
          request(URL, function (err, response, body) {
            if (!err && response.statusCode == 200) {
              var json = JSON.parse(body);
              data.id = json.id;
              data.name = json.name;
              data.summonerLevel = json.summonerLevel;
              data.profileIconId = json.profileIconId;
              callback(null, data);
            } else {
              message.channel.stopTyping();
              console.log(`Response code: ${response.statusCode}`);
              console.log(`Error: ${err}`);
            }
          });
        },
        function (data, callback) {
          URL = `https://euw1.api.riotgames.com/lol/league/v3/positions/by-summoner/${data.id}?api_key=${api}`;
          request(URL, function (err, response, body) {
            if (!err && response.statusCode == 200) {
              var json = body;
              if (JSON.stringify(body) == '"[]"') {
                data.ranked = false;
                callback(null, data);
              } else if (checkParse(json)) {
                data.ranked = true;
                json = json.replace("[", "");
                json = json.replace("]", "");
                json = JSON.parse(`${json}`);
                data.streak = json.hotStreak;
                data.type = json.queueType;
                data.wins = json.wins;
                data.losses = json.losses;
                data.tier = json.tier;
                data.rankNo = json.rank;
                data.LP = json.leaguePoints;
                callback(null, data);
              } else {
                data.ranked = true;
                json = JSON.parse(json);
                data.streak = json[0].hotStreak;
                data.type = json[0].queueType;
                data.wins = json[0].wins;
                data.losses = json[0].losses;
                data.tier = json[0].tier;
                data.rankNo = json[0].rank;
                data.LP = json[0].leaguePoints;
                callback(null, data);
              }
            } else {
              message.channel.stopTyping();
              console.log(`Response code: ${response.statusCode}`);
              console.log(`Error: ${err}`);
            }
          });
        },
        function (data, callback) {
          URL = `https://euw1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/${data.id}?api_key=${api}`;
          request(URL, function (err, response, body) {
            if (!err && response.statusCode == 200) {
              var json = JSON.parse(body);
              data.mostPlayed = {
                championId: json[0].championId,
                championLevel: json[0].championLevel,
                championPoints: json[0].championPoints,
              };
              data.secondPlayed = {
                championId: json[1].championId,
                championLevel: json[1].championLevel,
                championPoints: json[1].championPoints,
              };
              data.thirdPlayed = {
                championId: json[2].championId,
                championLevel: json[2].championLevel,
                championPoints: json[2].championPoints,
              };
              callback(null, data);
            }
          });
        },
        function (data, callback) {
          URL = "https://ddragon.leagueoflegends.com/realms/euw.json";
          request(URL, function (err, response, body) {
            if (!err) {
              var json = JSON.parse(body);
              data.dDragon = json.n.profileicon;
              data.dDragonC = json.n.champion;
              callback(null, data);
            } else {
              message.channel.stopTyping();
              console.log(err);
            }
          });
        },
      ],
      function (err, data) {
        if (err) return console.log(err);
        dDragonURL = `http://ddragon.leagueoflegends.com/cdn/${data.dDragon}/img/profileicon/${data.profileIconId}.png`;
        var image;
        if (data.tier == "BRONZE")
          image = "https://mobalytics.gg/wp-content/uploads/2016/04/bronze.png";
        else if (data.tier == "SILVER")
          image = "https://elo-boost.net/images/tiers/silver_5.png";
        else if (data.tier == "GOLD")
          image = "https://elo-boost.net/images/tiers/gold.png";
        else if (data.tier == "PLATINUM")
          image = "https://cdn.leagueofgraphs.com/img/league-icons/160/4-1.png";
        else if (data.tier == "DIAMOND")
          image = "https://i.imgur.com/gtcKqmQ.png";
        else if (data.tier == "MASTERS")
          image =
            "https://i.pinimg.com/originals/53/b3/be/53b3be1b304304d5c36d18649af1b422.png";
        else
          image =
            "https://dumielauxepices.net/sites/default/files/league-of-legends-clipart-transparent-670997-1128079.png";

        if (data.ranked == false)
          image = `https://smurfsaccounts.com/wp-content/uploads/2017/02/unranked.png`;

        for (var x in client.champs) {
          if (client.champs[x].key == data.mostPlayed.championId) {
            data.mostPlayed.champName = client.champs[x].id;
            data.mostPlayed.champTitle = client.champs[x].title;
          }
          if (client.champs[x].key == data.secondPlayed.championId) {
            data.secondPlayed.champName = client.champs[x].id;
            data.secondPlayed.champTitle = client.champs[x].title;
          }
          if (client.champs[x].key == data.thirdPlayed.championId) {
            data.thirdPlayed.champName = client.champs[x].id;
            data.thirdPlayed.champTitle = client.champs[x].title;
          }
        }

        if (data.ranked) {
          var embed = new Discord.RichEmbed()
            .setAuthor(
              message.author.username,
              message.author.avatarURL
                ? message.author.avatarURL
                : message.author.defaultAvatarURL
            )
            .setTitle(data.name)
            .setThumbnail(dDragonURL)
            .setColor(randomColor)
            .setTimestamp()
            .setImage(image)
            .setDescription(`Summoner ${data.name} details`)
            .addField(`#⃣  Summoner ID`, `${data.id}`, true)
            .addField(`Summoner Level`, `${data.summonerLevel}`, true)
            .addField(`Rank`, `${capF(data.tier)} ${data.rankNo}`, true)
            .addField(`LP`, `${data.LP}`, true)
            .addField(`Wins : Losses`, `${data.wins} : ${data.losses}`, true)
            .addField(
              `🔥 Summoner on Streak`,
              `${data.streak ? `Yes` : `No`}`,
              true
            )
            .addField(
              `🔷 Most Played Champion`,
              `**Champion**: ${data.mostPlayed.champName}, ${data.mostPlayed.champTitle} \n **Level**: ${data.mostPlayed.championLevel} \n **Points**: ${data.mostPlayed.championPoints}`,
              true
            )
            .addField(
              `🔸 Second Most Played Champion`,
              `**Champion**: ${data.secondPlayed.champName}, ${data.secondPlayed.champTitle} \n **Level**: ${data.secondPlayed.championLevel} \n **Points**: ${data.secondPlayed.championPoints}`,
              true
            )
            .addField(
              `🔸 Third Most Played Champion`,
              `**Champion**: ${data.thirdPlayed.champName}, ${data.thirdPlayed.champTitle} \n **Level**: ${data.thirdPlayed.championLevel} \n **Points**: ${data.thirdPlayed.championPoints}`,
              true
            );

          message.channel.send({ embed });
        } else {
          var embed = new Discord.RichEmbed()
            .setAuthor(
              message.author.username,
              message.author.avatarURL
                ? message.author.avatarURL
                : message.author.defaultAvatarURL
            )
            .setTitle(data.name)
            .setThumbnail(dDragonURL)
            .setColor(randomColor)
            .setTimestamp()
            .setImage(image)
            .setDescription(`Summoner ${data.name} details`)
            .addField(`#⃣  Summoner ID`, `${data.id}`, true)
            .addField(`Summoner Level`, `${data.summonerLevel}`, true)
            .addField(`Rank`, `Unranked`)
            .addField(
              `🔷 Most Played Champion`,
              `**Champion**: ${data.mostPlayed.champName}, ${data.mostPlayed.champTitle} \n **Level**: ${data.mostPlayed.championLevel} \n **Points**: ${data.mostPlayed.championPoints}`,
              true
            )
            .addField(
              `🔸 Second Most Played Champion`,
              `**Champion**: ${data.secondPlayed.champName}, ${data.secondPlayed.champTitle} \n **Level**: ${data.secondPlayed.championLevel} \n **Points**: ${data.secondPlayed.championPoints}`,
              true
            )
            .addField(
              `🔸 Third Most Played Champion`,
              `**Champion**: ${data.thirdPlayed.champName}, ${data.thirdPlayed.champTitle} \n **Level**: ${data.thirdPlayed.championLevel} \n **Points**: ${data.thirdPlayed.championPoints}`,
              true
            );

          message.channel.send({ embed });
        }
      }
    );
  }

  if (message.content.toLowerCase().startsWith(`~spectate`)) {
    async.waterfall(
      [
        function (callback) {
          URL = `https://euw1.api.riotgames.com/lol/summoner/v3/summoners/by-name/${s_toSearch}?api_key=${api}`;
          request(URL, function (err, response, body) {
            if (!err && response.statusCode == 200) {
              var json = JSON.parse(body);
              data.id = json.id;
              data.name = json.name;
              data.profileIconId = json.profileIconId;
              callback(null, data);
            } else {
              message.channel.stopTyping();
              console.log(`Response code: ${response.statusCode}`);
              console.log(`Error: ${err}`);
              message.channel.send(
                response.statusCode == 404
                  ? `Error: Summoner **${data.name}** is not in a game`
                  : `Error Code: ${response.statusCode}`
              );
            }
          });
        },
        function (data, callback) {
          URL = `https://euw1.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/${data.id}?api_key=${api}`;
          request(URL, function (err, response, body) {
            if (!err && response.statusCode == 200) {
              var json = JSON.parse(body);
              for (var x in json.participants) {
                if (json.participants[x].summonerName == data.name) {
                  data.champId = json.participants[x].championId;
                  data.sumOne = json.participants[x].spell1Id;
                  data.sumTwo = json.participants[x].spell2Id;
                  console.log(
                    json.participants[x].gameCustomizationObjects.map((c) => c)
                  );
                }
              }
              data.start = json.gameStartTime;
              data.type = json.gameType;
              data.mode = json.gameMode;
              data.map = json.mapId;
              callback(null, data);
            } else {
              console.log(`Response code: ${response.statusCode}`);
              console.log(`Error: ${err}`);
              message.channel.stopTyping();
              message.channel.send(
                response.statusCode == 404
                  ? `Error: Summoner **${data.name}** is not in a game`
                  : `Error Code: ${response.statusCode}`
              );
            }
          });
        },
        function (data, callback) {
          URL = "https://ddragon.leagueoflegends.com/realms/euw.json";
          request(URL, function (err, response, body) {
            if (!err) {
              var json = JSON.parse(body);
              data.dDragon = json.n.champion;
              data.dDragonS = json.n.profileicon;
              callback(null, data);
            } else {
              message.channel.stopTyping();
              console.log(err);
            }
          });
        },
        function (data, callback) {
          URL = `http://ddragon.leagueoflegends.com/cdn/${data.dDragon}/data/en_US/champion.json`;
          for (var x in client.champs) {
            if (client.champs[x].key == data.champId) {
              data.champName = client.champs[x].id;
              data.champTitle = client.champs[x].title;
              data.tags = client.champs[x].tags;
            }
          }
          data.champSplash = `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${data.champName}_0.jpg`;
          callback(null, data);
        },
        function (data, callback) {
          URL = `http://ddragon.leagueoflegends.com/cdn/${data.dDragon}/data/en_US/summoner.json`;
          request(URL, function (err, response, body) {
            if (!err) {
              var json = JSON.parse(body);
              for (var x in json.data) {
                if (json.data[x].key == data.sumOne) {
                  data.sumOne = json.data[x].name;
                  data.sumOneId = json.data[x].id;
                }
              }
              for (var x in json.data) {
                if (json.data[x].key == data.sumTwo) {
                  data.sumTwo = json.data[x].name;
                  data.sumTwoId = json.data[x].id;
                }
              }
              callback(null, data);
            }
          });
        },
      ],
      function (err, data) {
        let profilePic = `http://ddragon.leagueoflegends.com/cdn/${data.dDragon}/img/profileicon/${data.profileIconId}.png`;

        let embed = new Discord.RichEmbed()
          .setAuthor(data.name, profilePic)
          .setTitle(`${data.name}`)
          .setDescription(`Playing **${data.champName}**, ${data.champTitle}`)
          .addField(`Game Type`, `${findType(data.type)}`, true)
          .addField(`Game Mode`, `${findMode(data.mode)}`, true)
          .addField(`Map`, `${findMap(data.map)}`, true)
          .addField(
            `Summoners`,
            `[${
              data.sumOne
            }](${`http://ddragon.leagueoflegends.com/cdn/${data.dDragonS}/img/spell/${data.sumOneId}.png`}), [${
              data.sumTwo
            }](${`http://ddragon.leagueoflegends.com/cdn/${data.dDragonS}/img/spell/${data.sumTwoId}.png`})`,
            true
          )
          .setImage(data.champSplash)
          .setTimestamp();
        message.channel.send({ embed });
      }
    );
  }

  if (message.content.toLowerCase().startsWith(`~champion`)) {
    let c_toSearch = args.join("").toLowerCase();
    async.waterfall(
      [
        function (callback) {
          URL = "https://ddragon.leagueoflegends.com/realms/euw.json";
          request(URL, function (err, response, body) {
            if (!err) {
              var json = JSON.parse(body);
              data.dDragon = json.n.champion;
              callback(null, data);
            } else {
              console.log(`Response code: ${response.statusCode}`);
              console.log(`Error: ${err}`);
              message.channel.stopTyping();
              console.log(err);
            }
          });
        },
        function (data, callback) {
          for (var x in client.champs) {
            if (client.champs[x].id.toLowerCase() == c_toSearch) {
              data.champName = client.champs[x].name;
              data.champTag = client.champs[x].id;
            }
          }
          callback(null, data);
        },
        function (data, callback) {
          URL = `http://ddragon.leagueoflegends.com/cdn/${data.dDragon}/data/en_US/champion/${data.champName}.json`;
          request(URL, function (err, response, body) {
            if (!err && response.statusCode == 200) {
              var json = JSON.parse(body);
              data.champId = json.data[`${data.champName}`].key;
              data.champTitle = json.data[`${data.champName}`].title;
              data.skins = json.data[`${data.champName}`].skins;
              data.lore = json.data[`${data.champName}`].lore;
              data.allyTips = json.data[`${data.champName}`].allytips;
              data.enemyTips = json.data[`${data.champName}`].enemytips;
              data.tags = json.data[`${data.champName}`].tags;
              data.difficulty = json.data[`${data.champName}`].info.difficulty;
              data.spells = {
                q: {
                  name: json.data[`${data.champName}`].spells[0].name,
                  description:
                    json.data[`${data.champName}`].spells[0].description,
                },
                w: {
                  name: json.data[`${data.champName}`].spells[1].name,
                  description:
                    json.data[`${data.champName}`].spells[1].description,
                },
                e: {
                  name: json.data[`${data.champName}`].spells[2].name,
                  description:
                    json.data[`${data.champName}`].spells[2].description,
                },
                r: {
                  name: json.data[`${data.champName}`].spells[3].name,
                  description:
                    json.data[`${data.champName}`].spells[3].description,
                },
              };
              data.passive = {
                name: json.data[`${data.champName}`].passive.name,
                description: json.data[`${data.champName}`].passive.description,
              };
            } else {
              console.log(`Response code: ${response.statusCode}`);
              console.log(`Error: ${err}`);
              message.channel.stopTyping();
            }
            callback(null, data);
          });
        },
      ],
      function (err, data) {
        URL = `http://ddragon.leagueoflegends.com/cdn/img/champion/loading/${data.champName}_0.jpg`;
        var skins = [];
        for (var x in data.skins) {
          if (data.skins[x].name == "default") continue;
          skins.push(data.skins[x].name);
        }

        data.passive.description = data.passive.description.replace(
          /<font color=\'#FFF673\'> | <\/font>/g,
          "*"
        );
        data.passive.description = data.passive.description.replace(
          /<br>/g,
          "\n"
        );
        data.spells.q.description = data.spells.q.description.replace(
          /<font color=\'#FFF673\'> | <\/font>/g,
          "*"
        );
        data.spells.q.description = data.spells.q.description.replace(
          /<br>/g,
          "\n"
        );
        data.spells.w.description = data.spells.w.description.replace(
          /<font color=\'#FFF673\'> | <\/font>/g,
          "*"
        );
        data.spells.w.description = data.spells.w.description.replace(
          /<br>/g,
          "\n"
        );
        data.spells.e.description = data.spells.e.description.replace(
          /<font color=\'#FFF673\'> | <\/font>/g,
          "*"
        );
        data.spells.e.description = data.spells.e.description.replace(
          /<br>/g,
          "\n"
        );
        data.spells.r.description = data.spells.r.description.replace(
          /<font color=\'#FFF673\'> | <\/font>/g,
          "*"
        );
        data.spells.r.description = data.spells.r.description.replace(
          /<br>/g,
          "\n"
        );

        var embed = new Discord.RichEmbed()
          .setAuthor(
            message.author.username,
            message.author.avatarURL
              ? message.author.avatarURL
              : message.author.defaultAvatarURL
          )
          .setColor(randomColor)
          .setTitle(`${data.champName}, ${data.champTitle}`)
          .setDescription(`${data.lore}`)
          .setImage(URL)
          .addField(`Champion ID`, data.champId, true)
          .addField(`Tags`, `${data.tags.join(", ")}`, true)
          .addField(`Difficulty`, data.difficulty, true)
          .addField(`Tips`, `-${data.allyTips.join("\n-")}`, true)
          .addField(`Tips (Enemy)`, `-${data.enemyTips.join("\n-")}`, true)
          .addField(`Skins (${skins.length})`, skins.join(", "), true)
          .addField(
            `Passive`,
            `**${data.passive.name}**: ${data.passive.description
              .replace("<font color='#FFF673'>", "")
              .replace("</font>", "")}`
          )
          .addField(
            `Q`,
            `**${data.spells.q.name}**: ${data.spells.q.description
              .replace("<font color='#FFF673'>", "")
              .replace("</font>", "")}`,
            true
          )
          .addField(
            `W`,
            `**${data.spells.w.name}**: ${data.spells.w.description
              .replace("<font color='#FFF673'>", "")
              .replace("</font>", "")}`,
            true
          )
          .addField(
            `E`,
            `**${data.spells.e.name}**: ${data.spells.e.description
              .replace("<font color='#FFF673'>", "")
              .replace("</font>", "")}`,
            true
          )
          .addField(
            `R`,
            `**${data.spells.r.name}**: ${data.spells.r.description
              .replace("<font color='#FFF673'>", "")
              .replace("</font>", "")}`,
            true
          );

        message.channel.send({ embed });
      }
    );
  }

  message.channel.stopTyping();
};

function capF(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

var findMap = function (id) {
  switch (id) {
    case 1:
      return `Summoner's Rift`;
    case 2:
      return `Summoner's Rift`;
    case 3:
      return `The Proving Grounds`;
    case 4:
      return `Twisted Treeline`;
    case 8:
      return `The Crystal Scar`;
    case 10:
      return `Twisted Treeline`;
    case 11:
      return `Summoner's Rift`;
    case 12:
      return `Howling Abyss`;
    case 14:
      return `Butcher's Bridge`;
    case 16:
      return `Cosmic Ruins`;
    case 18:
      return `Valoran City Park`;
    case 19:
      return `Substructure 43`;
    case 20:
      return `Crash Site`;
    case 21:
      return `Nexus Blitz`;
    default:
      return `Summoner's Rift`;
  }
};

var checkParse = function (json) {
  var x;
  try {
    json = json.replace("[", "");
    json = json.replace("]", "");
    x = JSON.parse(json);
    return 1;
  } catch (e) {
    if (e) {
      return 0;
    }
  }
};

var findType = function (type) {
  switch (type) {
    case `CUSTOM_GAME`:
      return `Custom game`;
    case `TUTORIAL_GAME`:
      return `Tutorial game`;
    case `MATCHED_GAME`:
      return `Normal/Ranked Game`;
  }
};

var findMode = function (mode) {
  switch (mode) {
    case `CLASSIC`:
      return `SR/TT game`;
    case `ODIN`:
      return `Dominion game`;
    case `ARAM`:
      return `ARAM game`;
    case `TUTORIAL`:
      return `Tutorial game`;
    case `URF`:
      return `URF game`;
    case `DOOMBOTSTEEMO`:
      return `Doom Bots game`;
    case `ONEFORALL`:
      return `One For All game`;
    case `ASCENSION`:
      return `Ascension game`;
    case `FIRSTBLOOD`:
      return `Snowdown Showdown game`;
    case `KINGPORO`:
      return `Legend of the Poro King game`;
    case `SIEGE`:
      return `Nexus Siege game`;
    case `ASSASSINATE`:
      return `Blood Hunt Assassin game`;
    case `ARSR`:
      return `All Random Summoner's Rift game`;
    case `DARKSTAR`:
      return `Dark Star: Singularity game`;
    case `STARGUARDIAN`:
      return `Star Guardian Invasion game`;
    case `PROJECT`:
      return `PROJECT: Hunters game`;
    case `GAMEMODEX`:
      return `Nexus Blitz game`;
    case `ODYSSEY`:
      return `Odyssey: Extraction game`;
    default:
      return `SR/TT game`;
  }
};

exports.conf = {
  aliases: ["lol", "summoner", "spectate", "requestchamps", "champion"],
  permLevel: 0,
};

exports.help = {
  name: "league",
  description: "EVERYTHING TO DO WITH LEAGUE LUL",
  usage: "",
};
