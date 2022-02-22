module.exports = (oUser, nUser) => {
  if (oUser.username !== nUser.username) {
    console.log(
      `====================================================================================\n"${oUser.username}" just changed their name to "${nUser.username}"\n====================================================================================`
    );
  }

  if (oUser.avatarURL !== oUser.avatarURL) {
    console.log(
      `====================================================================================\n"${nUser.username}" just changed their profile picture\n====================================================================================`
    );
  }
};
