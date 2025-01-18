import DBDBaseCommand from "./dbd/dbd.js";
import InfoBaseCommand from "./info/info.js";
import ReminderBaseCommand from "./reminder/reminder.js";
import UpdateBaseCommand from "./update/update.js";

const SubCommands = [DBDBaseCommand, InfoBaseCommand, ReminderBaseCommand, UpdateBaseCommand];

export default SubCommands;
