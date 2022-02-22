module.exports = (channel) => {
  let guild = channel.guild;
  console.log(
    `${channel.type} channel \"${channel.name}\" has been deleted from \"${channel.guild.name}\"`
  );
};
