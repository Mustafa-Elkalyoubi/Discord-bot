module.exports = (channel) => {
  return;
  if (!channel.name) return;
  let guild = channel.guild;
  console.log(
    `A ${channel.type} channel called \"${channel.name}\" has been made in \"${guild.name}\"`
  );
  if (channel.type === "text") return channel.send("First lul");
};
