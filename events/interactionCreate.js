module.exports = async (interaction) => {
  if (!interaction.isButton()) return;
  interaction.channel.send(`${interaction.user} Shashamga`);
  const filter = (i) => i.customId === "shashamga";
  const collector = interaction.channel.createMessageComponentCollector({
    filter,
    time: 15000,
  });
  collector.on("collect", async (i) => {
    if (i.customId === "shashamga") {
      await i.deferUpdate();
      await wait(3000);
      await i.editReply({ content: "A button was clicked!", components: [] });
      if (i.user.id === "187507781392269313")
        i.update({ content: "haha", components: [] });
    }
  });

  collector.on("end", (collected) =>
    console.log(`Collected ${collected.size} items`)
  );
};
