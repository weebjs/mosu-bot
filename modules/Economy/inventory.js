const mongoose = require('mongoose');
const Economy = require('../../Schemas/EconomySchema');
const colors = require(`../../config/config.json`).colors;
const moment = require('moment');

module.exports = {
    name: 'inventory',
    description: 'View your inventory of items.',
    aliases: ["inv"],
    cooldown: false,
    usage: 'mosu inventory',
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
                    Wallet: 0,
                    Inventory: [] // Add an inventory array to the schema
                });
                await userEconomy.save();
            }

            const inventory = userEconomy.Inventory || [];

            if (inventory.length === 0) {
                const embed = {
                    title: "Your Inventory",
                    description: "Your inventory is empty.",
                    color: colors.red,
                    timestamp: moment().toISOString(),
                };

                await message.createMessage({ embeds: [embed], replyMessageIds: [message.id] });
            } else {
                const itemList = inventory.map(item => `${item.name} (x${item.quantity})`).join('\n');

                const embed = {
                    title: "Your Inventory",
                    description: itemList,
                    color: colors.red,
                    timestamp: moment().toISOString(),
                    footer: {
                        text: `Total items: ${inventory.reduce((sum, item) => sum + item.quantity, 0)}`
                    }
                };

                await message.createMessage({ embeds: [embed], replyMessageIds: [message.id] });
            }
        } catch (err) {
            console.error(err);
        }
    }
}