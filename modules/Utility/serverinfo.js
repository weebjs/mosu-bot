module.exports = {
    name: `serverinfo`,
    description: `Get information on a server.`,
    usage: ``,
    async execute(message, args, client) {
        const guild = client.guilds.get(message.guildID)
        const embed = {
            title: `${guild.name}`,
            description: guild.description || "This server has no description",
            fields: [
                {
                    name: "Server Details",
                    value: `\`\`\`ID: ${guild.id} \nOwnerID: ${guild.ownerID} \nURL: guilded.gg/${guild.url} \nServer Created: ${guild.createdAt.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })} \nVerified: ${guild.verified}\`\`\``,
                },
            ],            
        };
        await message.createMessage({ embeds: [embed], replyMessageIds: [message.id], isSilent: true });
    }
};