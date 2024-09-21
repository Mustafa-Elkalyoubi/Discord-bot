import { Message } from "discord.js";

const TestCommand: MessageCommand = {
  conf: {
    aliases: ["t"],
    permLevel: 4,
  },

  help: {
    name: "test",
    description: "testing lol",
    usage: "ya ok",
  },

  run: async (message: Message, args: string[]) => {
    console.log("we testing");
    console.log(message, args);
  },
};

export default TestCommand;
