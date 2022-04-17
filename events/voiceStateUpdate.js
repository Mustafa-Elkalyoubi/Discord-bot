module.exports = (oldState, newState) => {
  if (
    oldState.channelId === null &&
    newState.channelId !== null &&
    newState.member.user.id == "327921870567505921"
  ) {
    const msgs = [
      "Haha open blitz sir :)",
      "sir dont forget blitz",
      "bing chilling",
      "burger foot lettuce",
    ];
    let hassan = oldState.member.user;

    hassan.send(global.pickRandomArray(msgs));

    setTimeout(function () {
      hassan.send("Yo you opened blitz right?");
    }, 120000);
  }
};
