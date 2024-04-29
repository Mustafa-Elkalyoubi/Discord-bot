module.exports = {
  apps: [
    {
      name: "ts-bot",
      script: "dist/index.js",
      max_restarts: 3,
    },
  ],
};
