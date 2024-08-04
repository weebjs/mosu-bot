const mongoose = require('mongoose');
const Economy = require('../../Schemas/EconomySchema');
const colors = require(`../../config/config.json`).colors;
const moment = require('moment');
const fs = require('fs');
const path = require('path');

// Load search locations and items from JSON files
const searchLocations = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/economy/searchLocations.json'))).locations;
const possibleItems = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/economy/searchItems.json'))).items;

module.exports = {
    name: 'search',
    description: 'Search for items in random places.',
    aliases: ["find"],
    cooldown: true,
    usage: 'mosu search',
    async execute(message, args, client) {
        const guildId = message.guildID;
        const userId = message.member.id;

        try {
            let userEconomy = await Economy.findOne({ GuildId: guildId, User: userId });

            if (!userEconomy) {
                userEconomy = new Economy({
                    GuildId: guildId,
                    User: userId,
                    Bank: 0,
                    Wallet: 0,
                    Inventory: []
                });
                await userEconomy.save();
            }

            const location = searchLocations[Math.floor(Math.random() * searchLocations.length)];
            const foundItem = getRandomItem();

            if (foundItem) {
                // Add item to inventory
                const inventoryItem = userEconomy.Inventory.find(i => i.name === foundItem.name);
                if (inventoryItem) {
                    inventoryItem.quantity += 1;
                } else {
                    userEconomy.Inventory.push({ name: foundItem.name, quantity: 1 });
                }
                await userEconomy.save();

                const embed = {
                    title: `While searching ${location}, you found a \`${foundItem.name}\`!`,
                    fields: [
                        { name: "Item Value", value: `\`$${foundItem.value}\``, inline: true },
                        { name: "Added to Inventory", value: "✅", inline: true }
                    ],
                    color: colors.green,
                    timestamp: moment().toISOString()
                };
                await message.createMessage({ embeds: [embed], replyMessageIds: [message.id] });
            } else {
                const embed = {
                    title: `You searched ${location}, but didn't find anything valuable.`,
                    color: colors.red,
                    timestamp: moment().toISOString()
                };
                await message.createMessage({ embeds: [embed], replyMessageIds: [message.id] });
            }
        } catch (err) {
            console.error(err);
        }
    }
};

function getRandomItem() {
    // 70% chance of not getting an item
    if (Math.random() < 0.7) {
        return null;
    }

    // 30% chance of getting an item
    const rand = Math.random();
    let cumulativeProbability = 0;
    for (const item of possibleItems) {
        cumulativeProbability += item.rarity;
        if (rand <= cumulativeProbability) {
            return item;
        }
    }
    return null; // Fallback in case no item is selected (shouldn't happen)
}