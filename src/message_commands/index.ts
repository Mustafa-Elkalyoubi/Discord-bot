import Eval from "./eval.js";
import Invite from "./invite.js";
import Ping from "./ping.js";
import Reboot from "./reboot.js";
import Reload from "./reload.js";
import Test from "./test.js";
import TimeConvert from "./timeConvert.js";
import ToggleAI from "./toggleAI.js";
import VoiceNote from "./vn.js";

const MessageCommands: MessageCommand[] = [
  Eval,
  Invite,
  Ping,
  Reboot,
  Reload,
  Test,
  TimeConvert,
  ToggleAI,
  VoiceNote,
];

export default MessageCommands;
