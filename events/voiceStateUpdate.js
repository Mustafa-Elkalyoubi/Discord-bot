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

    oldState.member.user.send(global.pickRandomArray(msgs));
  }
};
