const { model, Schema } = require("mongoose");

let CooldownSchema = new Schema({
    commandName: { type: String, required: true },
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    timestamp: { type: Date, required: true }
});

module.exports = model("Cooldown", CooldownSchema);