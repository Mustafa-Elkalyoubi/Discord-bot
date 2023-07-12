import { ChatInputCommandInteraction, MessageContextMenuCommandInteraction } from "discord.js";

export const StepPrinter = function (
  interaction: ChatInputCommandInteraction | MessageContextMenuCommandInteraction
) {
  let steps: string[] = [];

  return function (step: string, reset = false) {
    if (!steps || reset) steps = [];
    steps.push(step);

    interaction.editReply({
      content: `\`\`\`\n• ${steps.join("\n• ")}\n\`\`\``,
    });
  };
};
