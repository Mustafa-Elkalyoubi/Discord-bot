exports.run = async function run(client, message, args) {
  let length = args.join(" ").split("").length;
  let msg = args.join(" ").split("");
  var i;
  let back = "";
  for (i = 0; i < length; i++) {
    switch (msg[i]) {
      case "A":
        back += "𝓐";
        break;
      case "B":
        back += "𝓑";
        break;
      case "C":
        back += "𝓒";
        break;
      case "D":
        back += "𝓓";
        break;
      case "E":
        back += "𝓔";
        break;
      case "F":
        back += "𝓕";
        break;
      case "G":
        back += "𝓖";
        break;
      case "H":
        back += "𝓗";
        break;
      case "I":
        back += "𝓘";
        break;
      case "J":
        back += "𝓙";
        break;
      case "K":
        back += "𝓚";
        break;
      case "L":
        back += "𝓛";
        break;
      case "M":
        back += "𝓜";
        break;
      case "N":
        back += "𝓝";
        break;
      case "O":
        back += "𝓞";
        break;
      case "P":
        back += "𝓟";
        break;
      case "Q":
        back += "𝓠";
        break;
      case "R":
        back += "𝓡";
        break;
      case "S":
        back += "𝓢";
        break;
      case "T":
        back += "𝓣";
        break;
      case "U":
        back += "𝓤";
        break;
      case "V":
        back += "𝓥";
        break;
      case "W":
        back += "𝓦";
        break;
      case "X":
        back += "𝓧";
        break;
      case "Y":
        back += "𝓨";
        break;
      case "Z":
        back += "𝓩";
        break;
      case "a":
        back += "𝓪";
        break;
      case "b":
        back += "𝓫";
        break;
      case "c":
        back += "𝓬";
        break;
      case "d":
        back += "𝓭";
        break;
      case "e":
        back += "𝓮";
        break;
      case "f":
        back += "𝓯";
        break;
      case "g":
        back += "𝓰";
        break;
      case "h":
        back += "𝓱";
        break;
      case "i":
        back += "𝓲";
        break;
      case "j":
        back += "𝓳";
        break;
      case "k":
        back += "𝓴";
        break;
      case "l":
        back += "𝓵";
        break;
      case "m":
        back += "𝓶";
        break;
      case "n":
        back += "𝓷";
        break;
      case "o":
        back += "𝓸";
        break;
      case "p":
        back += "𝓹";
        break;
      case "q":
        back += "𝓺";
        break;
      case "r":
        back += "𝓻";
        break;
      case "s":
        back += "𝓼";
        break;
      case "t":
        back += "𝓽";
        break;
      case "u":
        back += "𝓾";
        break;
      case "v":
        back += "𝓿";
        break;
      case "w":
        back += "𝔀";
        break;
      case "x":
        back += "𝔁";
        break;
      case "y":
        back += "𝔂";
        break;
      case "z":
        back += "𝔃";
        break;
      case " ":
        back += " ";
        break;
      default:
        back += msg[i];
    }
  }
  message.channel.send(back);
};

exports.conf = {
  aliases: [],
  permLevel: 0,
};

exports.help = {
  name: "cursive",
  description: "cursive font :D",
  usage: "cursive *msg*",
};
