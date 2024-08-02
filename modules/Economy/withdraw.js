const mongoose = require('mongoose');
const Economy = require('../../Schemas/EconomySchema'); 
const colors = require(`../../config/config.json`).colors;
const moment = require('moment');

module.exports = {
    name: 'withdraw',
    description: 'Withdraw money from your bank to your wallet.',
    aliases: ["with"],
    usage: 'mosu withdraw <amount>',
    async execute(message, args, client) {
        const guildId = message.guildID;
        const member = message.member;
        const userId = member.id;
        const avatar = message.member.avatarURL;

        // Check if an amount was provided
        if (!args[2]) {
            const embed = {
                title: 'Error',
                description: 'Please specify an amount to withdraw.',
                color: colors.red,
                timestamp: moment().toISOString(),
            };
            return message.createMessage({ embeds: [embed], replyMessageIds: [message.id] });
        }

        let amount = args[2].toLowerCase();
        
        try {
            let userEconomy = await Economy.findOne({ GuildId: guildId, User: userId });

            if (!userEconomy) {
                userEconomy = new Economy({
                    GuildId: guildId,
                    User: userId,
                    Bank: 0,
                    Wallet: 0
                });
                await userEconomy.save();
            }

            const bank = userEconomy.Bank;

            // Handle 'all' keyword
            if (amount === 'all') {
                amount = bank;
            } else {
                amount = parseInt(amount);
                if (isNaN(amount) || amount <= 0) {
                    const embed = {
                        title: 'Error',
                        description: "Please enter a valid positive number or 'all'.",
                        color: colors.red,
                        timestamp: moment().toISOString(),
                    };
                    return message.createMessage({ embeds: [embed], replyMessageIds: [message.id] });
                }
            }

            if (amount > bank) {
                const embed = {
                    title: 'Error',
                    description: "You don't have that much money in your bank!",
                    color: colors.red,
                    timestamp: moment().toISOString(),
                };
                return message.createMessage({ embeds: [embed], replyMessageIds: [message.id] });
            }

            // Update the user's economy
            userEconomy.Bank -= amount;
            userEconomy.Wallet += amount;
            await userEconomy.save();

            // Create the embed message for successful withdrawal
            const embed = {
                title: `Successfully withdrew \`$${amount}\` from your bank.`,
                color: colors.green,
                timestamp: moment().toISOString(),
            };

            await message.createMessage({ embeds: [embed], replyMessageIds: [message.id] });
        } catch (err) {
            console.error(err);
            const errorEmbed = {
                title: 'Error',
                description: "An error occurred while processing your withdrawal.",
                color: colors.red,
                timestamp: moment().toISOString(),
            };
            await message.createMessage({ embeds: [errorEmbed], replyMessageIds: [message.id] });
        }
    }
};