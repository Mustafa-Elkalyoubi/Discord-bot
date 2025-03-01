import TextCommand from "../utils/command/TextCommand.js";
import FindSteamGame from "./findsteamgame.js";
import FixBankLayout from "./fixbanklayout.js";
import GECommand from "./ge.js";
import Oull from "./oull.js";
import PestControl from "./pestcontrol.js";
import Ping from "./ping.js";
import Poll from "./poll.js";
import Roll from "./roll.js";
import SevenTVSteal from "./seventvsteal.js";
import Slayer from "./slayer.js";
import Text2Img from "./text2img.js";
import TearsOfGuthix from "./tog.js";
import WEBPToGIF from "./webptogif.js";
import WHTR from "./whohasthisrole.js";
// import YTDownloader from "./youtubedownload.js";

const Commands: Constructable<TextCommand>[] = [
  FindSteamGame,
  GECommand,
  Oull,
  PestControl,
  Ping,
  Poll,
  Roll,
  SevenTVSteal,
  Slayer,
  Text2Img,
  TearsOfGuthix,
  WEBPToGIF,
  WHTR,
  FixBankLayout,
  // YTDownloader,
];

export default Commands;
