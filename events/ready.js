const p = require("primebit.js");
const mongoose = require(`mongoose`);
const { mongoURI } = require(`../config/config.json`);

module.exports = {
    name: `ready`,
    async execute(client) {
        p.log(`Logged in as ${client.user.username}!`);
        p.success(`Registered ${client.commands.size} commands.`);

        // Wrap setTimeout into a Promise
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        try {
            await delay(3000);
            p.log(`In ${client.guilds.size} servers!`);
        } catch (err) {
            p.error(err);
        }

        if (!mongoURI) return;
        mongoose.connect(mongoURI)
            .then(() => {
                p.log(`This client is now connected to the database`);
            })
            .catch((err) => {
                console.log(err);
            });
    }
};