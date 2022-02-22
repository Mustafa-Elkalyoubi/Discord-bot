const moment = require("moment");
module.exports = (client) => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] Disconnected`);
};
