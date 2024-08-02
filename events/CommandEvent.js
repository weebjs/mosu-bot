const mongoose = require('mongoose');
const config = require(`../config/config.json`);
const colors = require(`../config/config.json`).colors;
const Cooldown = require('../Schemas/CooldownSchema'); 
const p = require("primebit.js");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    const member = await message.member;
    const guild = client.guilds.get(message.guildID);

    if (member.bot) return;

    let prefix = config.prefix + " ";
    if (!prefix) {
      await message.createMessage(`The developer did a fucky wucky.`);
      return;
    }

    const rawMessage = message.content;
    const args = rawMessage.split(" ");

    if (!rawMessage.startsWith(prefix)) return;
    if (rawMessage.startsWith(`![](`)) return;

    const commandName = args[1];

    const command = client.commands.get(commandName) || 
      Array.from(client.commands.values()).find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

      p.log(`${member.username} just ran the command "${commandName}" in "${guild.name}".`);


    if (!command) { 
      const embed = {
        title: `Error! | Unknown Command!`,
        fields: [
          {
            name: `Fix`,
            value: `*Ensure you type the command or its alias correctly. If this doesn't fix the error, the command may not exist.*`,
          },
        ],
        color: colors.red,
      };
      await message.createMessage({ embeds: [embed], replyMessageIds: [message.id], isPrivate: true });
      return;
    }

    if (command.cooldown === true) {
      const now = Date.now();
      const cooldownTime = 2 * 60 * 1000; // 2 minutes in milliseconds

      const cooldown = await Cooldown.findOne({ commandName: command.name, userId: member.id, guildId: message.guildID });

      if (cooldown) {
        const expirationTime = cooldown.timestamp.getTime() + cooldownTime;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          const embed = {
            title: `Cooldown!`,
            description: `You need to wait ${timeLeft.toFixed(0)} seconds before using the \`${command.name}\` command again.`,
            color: colors.yellow,
            footer: {
                text: "Please wait until the cooldown is finished."
            }
          };
          await message.createMessage({ embeds: [embed], replyMessageIds: [message.id], isPrivate: true });
          return;
        } else {
          // Remove the expired cooldown from the database
          await Cooldown.deleteOne({ _id: cooldown._id });
        }
      }

      // Set the new cooldown
      await Cooldown.create({
        commandName: command.name,
        userId: member.id,
        guildId: message.guildID,
        timestamp: new Date()
      });
    }

    command.execute(message, args, client);
  },
};