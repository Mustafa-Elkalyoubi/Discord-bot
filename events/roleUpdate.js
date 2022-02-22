const { SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG } = require("constants");
module.exports = (oRole, nRole) => {
  let msg = `Role ${oRole.name} updated: `;
  if (oRole.name != nRole.name) msg += `New name: ${nRole.name} | `;
  if (oRole.hexColor != nRole.hexColor) msg += `Color change | `;
  if (msg != `Role ${oRole.name} updated: `) console.log(msg);
};
