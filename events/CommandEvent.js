const config = require(`../config/config.json`);
const p = require("primebit.js");
const ServerSettings = require('../Schemas/SettingsSchema');


module.exports = {
    name: "messageCreate",
    async execute(message, client) {
        const member = await message.member;
        const guild = client.guilds.get(message.guildID);

        if (member.bot) return;

        let prefix;
        try {
            let serverSettings = await ServerSettings.findOne({ serverId: message.guildID });
            if (!serverSettings) {
                // Create a new server settings entry if it doesn't exist
                serverSettings = new ServerSettings({
                    serverId: message.serverId
                });
                await serverSettings.save();
            }
            prefix = serverSettings.prefix;

            if (!prefix) {
                const errorEmbed = {
                    title: "Error 102 - Prefix not found",
                    description: "The developer did a fucky wucky. Please contact the developer to fix this issue.",
                    color: 0xFF0000
                };
                await message.createMessage({ embeds: [errorEmbed] });
                return;
            }

            const rawMessage = message.content;
            const args = rawMessage.split(" ");

            if (!rawMessage.startsWith(prefix)) return;
            if (rawMessage.startsWith(`![](`)) return;

            const commandName = args[0].replace(prefix, "");

            if (!client.commands.get(commandName)) {
                const embed = {
                    title: "Error!",
                    description: "This command does not exist.",
                    color: 0xFF3131,
                    fields: [
                        { name: "Fix", value: "Please ensure you type the command in correctly, if this doesn't fix the error, Please contact the developer." }
                    ]
                };
                await message.createMessage({ embeds: [embed] });
                return;
            }

            // Log the command execution
            p.log(`${member.username} just ran the command "${commandName}" in "${guild.name}".`);

            await client.commands.get(commandName).execute(message, args, client);
        } catch (error) {
            p.error(error);
            const errorEmbed = {
                title: "Unexpected Error!",
                description: `An unexpected error occurred while processing your command. \n\`\`\`${error}\`\`\``,
                color: 0xFF3131,
                footer: {
                    text: "Please try again later or contact the developer."
                },
            };
            await message.createMessage({ embeds: [errorEmbed] });
        }
    }
};