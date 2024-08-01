const fs = require("fs")

module.exports = (client) => {
    client.handleCommands = async (commandFolders) => {

        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./modules/${folder}`).filter(file => file.endsWith(".js"));

            for (const file of commandFiles) {
                const command = require(`../modules/${folder}/${file}`);
                await client.commands.set(command.name, command);
            }
        }

    }
}