import FindSteamGame from "./findsteamgame";
import GECommand from "./ge";
import Oull from "./oull";
import PestControl from "./pestcontrol";
import Ping from "./ping";
import Poll from "./poll";
import Roll from "./roll";
import SevenTVSteal from "./seventvsteal";
import Slayer from "./slayer";
import Text2Img from "./text2img";
import TearsOfGuthix from "./tog";
import WEBPToGIF from "./webptogif";
import WHTR from "./whohasthisrole";
import YTDownloader from "./youtubedownload";

const Commands: (new () => Command)[] = [
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
  YTDownloader,
];

export default Commands;
