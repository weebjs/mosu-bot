const mongoose = require('mongoose');
const Economy = require('../../Schemas/EconomySchema'); 
const colors = require(`../../config/config.json`).colors;
const moment = require('moment');

module.exports = {
    name: 'balance',
    description: 'Shows your wallet and bank balance.',
    aliases: ["bal"],
    usage: 'mosu balance',
    async execute(message, args, client) {
        const guildId = message.guildID;
        const member = message.member;
        const userId = member.id;
        const avatar = message.member.avatarURL;

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

            const wallet = userEconomy.Wallet;
            const bank = userEconomy.Bank;
            const maxBank = Economy.schema.path('Bank').options.max; // Get max bank from schema

            const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            // Get user's rank
            const rank = await getUserRank(guildId, userId);

            const embed = {
                author: {
                    name: `${member.username}'s Balance`,
                    icon_url: avatar
                },
                fields: [
                    {
                        name: ':briefcase: | Wallet',
                        value: `\`$${formatNumber(wallet)}\``,
                        inline: true
                    },
                    {
                        name: ':bank: | Bank',
                        value: `\`$${formatNumber(bank)}/${formatNumber(maxBank)}\``,
                        inline: true
                    },
                    {
                        name: ':chart_with_upwards_trend: | Total',
                        value: `\`$${formatNumber(wallet + bank)}\``,
                        inline: true
                    },
                    {
                        name: ':trophy: | Rank',
                        value: `\`#${rank}\``,
                        inline: true
                    }
                ],
                thumbnail: {
                    url: avatar
                },
                color: colors.red,
                timestamp: moment().toISOString()
            };

            await message.createMessage({ embeds: [embed], replyMessageIds: [message.id] });
        } catch (err) {
            console.error(err);
        }
    }
};

async function getUserRank(guildId, userId) {
    const allUsers = await Economy.find({ GuildId: guildId }).sort({ Bank: -1, Wallet: -1 });
    const userIndex = allUsers.findIndex(user => user.User === userId);
    return userIndex + 1;
}