module.exports = (oMessage, nMessage) => {
  if (oMessage.author.bot) return;
  if (nMessage.author.bot) return;

  if (oMessage.content != nMessage.content)
    console.log(
      `${oMessage.guild.name} || ${oMessage.author.username}: \"${oMessage.content}\" edited to \"${nMessage.content}\"`
    );
};
