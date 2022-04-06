module.exports = (oldState, newState) => {
  if (
    oldState.channelId === null &&
    newState.channelId !== null &&
    newState.member.user.id == "327921870567505921"
  ) {
    oldState.member.user.send("Haha open blitz sir :)");
  }
};
