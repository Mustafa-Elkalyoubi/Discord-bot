import DBDMainCommand from "./dbd/dbd";
import InfoMainCommand from "./info/info";
import ReminderMainCommand from "./reminder/reminder";
import UpdateMainCommand from "./update/update";

const Subcommands: (new () => BaseSubCommand)[] = [
  DBDMainCommand,
  InfoMainCommand,
  ReminderMainCommand,
  UpdateMainCommand,
];

export default Subcommands;
