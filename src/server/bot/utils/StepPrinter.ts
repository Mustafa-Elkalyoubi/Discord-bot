import { ChatInputCommandInteraction, MessageContextMenuCommandInteraction } from "discord.js";

export const StepPrinter = function (
  interaction: ChatInputCommandInteraction | MessageContextMenuCommandInteraction
) {
  let steps: string[] = [];

  const dict = {
    INFO: "•",
    POSITIVE: "+",
    NEGATIVE: "-",
  };

  return function (step: string, stepType: keyof typeof dict = "INFO", reset = false) {
    if (!steps || reset) steps = [];

    steps.push(`${dict[stepType]} ${step}`);

    interaction.editReply({
      content: `\`\`\`diff\n${steps.join("\n")}\n\`\`\``,
    });
  };
};
