const fs = require('fs');
const path = require('path');
const colors = require('../../config/config.json').colors;
const moment = require('moment');
const config = require('../../config/config.json');

module.exports = {
    name: 'help',
    description: 'Shows all available commands or info about a specific command.',
    aliases: ["commands"],
    usage: 'mosu help [command]',
    async execute(message, args, client) {
        const prefix = config.prefix + " ";
        const modulesPath = path.join(__dirname, '..');
        const categories = fs.readdirSync(modulesPath);

        if (args.length <= 2) {
            const embed = {
                title: 'Bot Commands',
                description: "Here's all commands for Mosu! \n Prefix is \`mosu\`",
                color: colors.red,
                fields: [],
                footer: {
                    text: `Use ${prefix}help [command] for more info on a specific command.`
                }
            };

            categories.forEach(category => {
                const commands = fs.readdirSync(path.join(modulesPath, category))
                    .filter(file => file.endsWith('.js'))
                    .map(file => require(path.join(modulesPath, category, file)));

                const commandList = commands.map(cmd => `\`${cmd.name}\``).join(', ');

                embed.fields.push({
                    name: `${category.charAt(0).toUpperCase() + category.slice(1)}`,
                    value: commandList || 'No commands in this category.'
                });
            });

            return message.createMessage({ embeds: [embed], replyMessageIds: [message.id] });
        }

        const commandName = args[2].toLowerCase();
        const command = client.commands.get(commandName) || 
            Array.from(client.commands.values()).find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) {
            const errorEmbed = {
                title: 'Error! | Unknown Command!',
                fields: [
                    {
                        name: 'Fix',
                        value: '*Ensure you type the command or its alias correctly. If this doesn\'t fix the error, the command may not exist.*',
                    },
                ],
                color: colors.red,
            };
            return message.createMessage({ embeds: [errorEmbed], replyMessageIds: [message.id], isPrivate: true });
        }

        const commandEmbed = {
            title: `Command: ${command.name}`,
            color: colors.blue,
            fields: [
                { name: 'Description', value: command.description || 'No description provided.' },
                { name: 'Usage', value: command.usage || 'No usage provided.' },
                { name: 'Aliases', value: command.aliases ? command.aliases.join(', ') : 'No aliases.' },
                { name: 'Cooldown', value: command.cooldown ? 'Yes' : 'No' }
            ],
            timestamp: moment().toISOString()
        };

        message.createMessage({ embeds: [commandEmbed], replyMessageIds: [message.id] });
    }
};