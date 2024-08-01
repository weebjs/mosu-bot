const { model, Schema } = require("mongoose");

let EconomySchema = new Schema({
    GuildId: { type: String, required: true },
    User: { type: String, required: true },
    Bank: { type: Number, default: 0, min: 0 },
    Wallet: { type: Number, default: 0, min: 0 }
});

module.exports = model("EconomySchema", EconomySchema)