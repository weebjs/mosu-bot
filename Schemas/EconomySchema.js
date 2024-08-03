const { model, Schema } = require("mongoose");

let EconomySchema = new Schema({
    GuildId: { type: String, required: true },
    User: { type: String, required: true },
    Bank: { type: Number, default: 0, min: 0, max: 100 },
    Wallet: { type: Number, default: 0, min: 0 },
    lastBegTime: { type: Date, default: new Date(0) } // Add this line
});

module.exports = model("EconomySchema", EconomySchema);