const { Client } = require('touchguild');
const fs = require('fs');
const config = require('./config/config.json');
const client = new Client({ token: config.token });
const BadWord = require('./Schemas/BadWordSchema');
const mongoose = require('mongoose');

const handlerFiles = fs.readdirSync('./handlers/').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const commandFolders = fs.readdirSync('./modules');

const express = require('express');
const app = express();
const port = 5000;
const rateLimit = require("express-rate-limit")



const getServersRouter = require('./api/get-servers');
const getServerRouter = require('./api/get-server');
const updateServerPrefixRouter = require('./api/update-server-prefix');
const getBlacklistRouter = require('./api/get-blacklist');
const addBlacklistRouter = require('./api/add-blacklist');
const removeBlacklistRouter = require("./api/remove-blacklist")

// Mount the server routes
app.use('/api', getServersRouter);
app.use('/api', getServerRouter);
app.use('/api', updateServerPrefixRouter);
app.use('/api', getBlacklistRouter);
app.use('/api', addBlacklistRouter);
app.use('/api', removeBlacklistRouter);


// Middleware to parse JSON requests
app.use(express.json());

// Import the ServerSettingsSchema
const ServerSettings = require('./Schemas/SettingsSchema');

app.get('/', (req, res) => {
  res.send(`Ready`)
})

client.updateUserStatus('409oqQWd', {
  content: 'Zap | prefix is $',
  emoteId: 90002563
});

client.on('messageCreate', async (message) => {
  const serverId = message.guildID;
  const content = message.content.toLowerCase();

  try {
    const badWords = await BadWord.find({ serverId });

    for (const badWord of badWords) {
      if (content.includes(badWord.word)) {
        try {
          await message.delete();
        } catch (error) {
          console.error('Error deleting message:', error);
        }
        break;
      }
    }
  } catch (error) {
    console.error('Error checking for bad words:', error);
  }
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