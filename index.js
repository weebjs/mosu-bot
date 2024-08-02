const { Client } = require('touchguild');
const fs = require('fs');
const config = require('./config/config.json');
const client = new Client({ token: config.token });
const mongoose = require('mongoose');

const handlerFiles = fs.readdirSync('./handlers/').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const commandFolders = fs.readdirSync('./modules');

const express = require('express');
const app = express();
const port = 5000;


app.get('/', (req, res) => {
  res.send(`Ready`)
})

client.updateUserStatus('41qo1284', {
  content: "Hello, I'm Mosu!",
  emoteId: 90002554
});




(async () => {
  for (const file of handlerFiles) {
    require(`./handlers/${file}`)(client);
  }

  client.commands = new Map();
  client.registerEvents(eventFiles, './events');
  client.handleCommands(commandFolders);

  await client.connect(config.token);

  app.listen(port, () => {
    console.log('\x1b[32m[PORT]\x1b[0m:', port);
  });
  
})();