import { SlashCommandBuilder } from "discord.js";
import BaseSlashSubCommand from "../../utils/BaseSlashSubCommand";

export default class BaseSubCommand extends BaseSlashSubCommand {
  constructor() {
    super(
      "reminder",
      [{ name: "add", subCommands: ["from-now", "at", "recurring"] }],
      ["check", "remove"]
    );
  }

  getSlashCommandJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription("reminder commands")
      .setDMPermission(false)
      .addSubcommandGroup((group) =>
        group
          .setName("add")
          .setDescription("Add a new reminder")
          .addSubcommand((subcommand) =>
            subcommand
              .setName("from-now")
              .setDescription("Set a reminder in a from-now format (e.g. 5 hours from now)")
              .addStringOption((option) =>
                option
                  .setName("message")
                  .setDescription("Set the message that will send at the specified time")
                  .setRequired(true)
              )
              .addIntegerOption((option) => option.setName("days").setDescription("Day count"))
              .addIntegerOption((option) => option.setName("hours").setDescription("Hour count"))
              .addIntegerOption((option) =>
                option.setName("minutes").setDescription("Minute count")
              )
          )
          .addSubcommand((subcommand) =>
            subcommand
              .setName("at")
              .setDescription(
                "Set a reminder at a specific date and/or time (e.g. 2:00 pm on 20/2/2012"
              )
              .addStringOption((option) =>
                option
                  .setName("message")
                  .setDescription("Set the message that will send at the specified time")
                  .setRequired(true)
              )
              .addIntegerOption((option) =>
                option.setName("day").setDescription("Day (default is today)")
              )
              .addIntegerOption((option) =>
                option.setName("month").setDescription("Month (default is this month)")
              )
              .addIntegerOption((option) =>
                option.setName("year").setDescription("Year (default is this year)")
              )
              .addIntegerOption((option) =>
                option.setName("hour").setDescription("Hour (default is 00:00)")
              )
              .addIntegerOption((option) => option.setName("minute").setDescription("Minute"))
              .addStringOption((option) =>
                option
                  .setName("meridiem")
                  .setDescription("AM or PM")
                  .addChoices({ name: "AM", value: "AM" }, { name: "PM", value: "PM" })
              )
          )
          .addSubcommand((subcommand) =>
            subcommand
              .setName("recurring")
              .setDescription(
                "Set a recurring reminder on a specific day of the week at a specific time ( eg Monday 2:00 )"
              )
              .addStringOption((option) =>
                option
                  .setName("message")
                  .setDescription("What message do you want to be reminded about?")
                  .setRequired(true)
              )
              .addStringOption((option) =>
                option
                  .setName("day")
                  .setDescription("The day of the week lol")
                  .addChoices(
                    { name: "Sunday", value: "sun" },
                    { name: "Monday", value: "mon" },
                    { name: "Tuesday", value: "tue" },
                    { name: "Wednesday", value: "wed" },
                    { name: "Thursday", value: "thur" },
                    { name: "Friday", value: "fri" },
                    { name: "Saturday", value: "sat" }
                  )
                  .setRequired(true)
              )
              .addIntegerOption((option) =>
                option
                  .setName("hour")
                  .setDescription(
                    "At what hour do you want to be reminded? (24 hour system default)"
                  )
                  .setRequired(true)
              )
              .addIntegerOption((option) =>
                option
                  .setName("minute")
                  .setDescription("At what minute do you want to be reminded?")
              )
              .addStringOption((option) =>
                option
                  .setName("meridiem")
                  .setDescription("AM or PM? (optional)")
                  .addChoices({ name: "AM", value: "AM" }, { name: "PM", value: "PM" })
              )
          )
      )
      .addSubcommand((subcommand) =>
        subcommand.setName("check").setDescription("Check your current reminders")
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("remove")
          .setDescription(`Remove a reminder that you set`)
          .addStringOption((option) =>
            option
              .setName("id")
              .setDescription("The reminder's ID you want to delete")
              .setRequired(true)
              .setAutocomplete(true)
          )
      );
  }
}
