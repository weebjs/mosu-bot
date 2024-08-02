const mongoose = require('mongoose');
const Economy = require('../../Schemas/EconomySchema'); 
const colors = require(`../../config/config.json`).colors;
const moment = require('moment');
const messages = require('../../config/failandsuccess.json'); // Import the messages JSON file

module.exports = {
    name: 'beg',
    description: 'Beg for money with a chance of success or failure.',
    aliases: ["beg"],
    cooldown: true, 
    usage: 'mosu beg',
    async execute(message, args, client) {
        const guildId = message.guildID;
        const member = message.member;
        const userId = member.id;
        const avatar = message.member.avatarURL;

        const successMessages = messages.successMessages;
        const failureMessages = messages.failureMessages;

        try {
            let userEconomy = await Economy.findOne({ GuildId: guildId, User: userId });

            if (!userEconomy) {
                // Create a new account if the user doesn't have one
                userEconomy = new Economy({
                    GuildId: guildId,
                    User: userId,
                    Bank: 0,
                    Wallet: 0 // Starting balance in wallet
                });
                await userEconomy.save();
            }

            const isSuccess = Math.random() < 0.5; // 50% chance of success

            if (isSuccess) {
                const cashAmount = Math.floor(Math.random() * 11) + 5; // Random amount between 5 and 15
                userEconomy.Wallet += cashAmount;
                await userEconomy.save();

                const successMessage = successMessages[Math.floor(Math.random() * successMessages.length)];

                const embed = {
                    title: `${successMessage}`,
                    description: `You received \`$${cashAmount}\`!`,
                    color: colors.green,
                    timestamp: moment().toISOString(),
                };

                await message.createMessage({ embeds: [embed], replyMessageIds: [message.id] });
            } else {
                const failureMessage = failureMessages[Math.floor(Math.random() * failureMessages.length)];

                const embed = { 
                    title: `${failureMessage}`,
                    color: colors.red,
                    timestamp: moment().toISOString(),
                };

                await message.createMessage({ embeds: [embed], replyMessageIds: [message.id] });
            }
        } catch (err) {
            console.error(err);
        }
    }
};