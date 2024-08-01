const mongoose = require('mongoose');
const Economy = require('../models/EconomySchema'); // Adjust the path as necessary

module.exports = {
  name: 'balance',
  description: 'Shows your wallet and bank balance.',
  usage: '$balance',
  async execute(message, args, client) {
    const userId = message.author.id;
    const guildId = message.guildID;

    try {
      let userEconomy = await Economy.findOne({ GuildId: guildId, User: userId });

      if (!userEconomy) {
        // Create a new account if the user doesn't have one
        userEconomy = new Economy({
          GuildId: guildId,
          User: userId,
          Bank: 0,
          Wallet: 100 // Starting balance in wallet
        });
        await userEconomy.save();
      }

      const wallet = userEconomy.Wallet;
      const bank = userEconomy.Bank;

      const embed = {
        title: `${message.author.username}'s Balance`,
        fields: [
          {
            name: 'Wallet',
            value: `${wallet} coins`,
            inline: true
          },
          {
            name: 'Bank',
            value: `${bank} coins`,
            inline: true
          },
          {
            name: 'Total',
            value: `${wallet + bank} coins`,
            inline: false
          }
        ],
        color: 0x00FF00, // Green color
        footer: {
          text: userEconomy.isNew ? "New account created!" : "Existing account"
        }
      };

      await message.createMessage({ embeds: [embed], replyMessageIds: [message.id] });
    } catch (err) {
      console.error(err);
      await throw new Error("An error occured while fetching the user's balance, Please try again later.");
    }
  }
};