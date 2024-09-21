const ToggleAICommand: MessageCommand = {
  conf: {
    aliases: ["toggleAI", "toggleai", "toggleAi", "toggle", "ai"],
    permLevel: 4,
  },
  help: {
    name: "toggleAI",
    description: "Turns ai on/off",
    usage: "~toggleAi",
  },
  run: async (message, _, client) => {
    const onOrOff = client.toggleAI();

    message.reply(`text2img is now ${onOrOff ? "enabled" : "disabled"}`);
  },
};

export default ToggleAICommand;
