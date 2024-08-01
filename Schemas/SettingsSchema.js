// schemas/ServerSettingsSchema.js
const mongoose = require('mongoose');

const ServerSettingsSchema = new mongoose.Schema({
  serverId: { type: String, required: true, unique: true },
  prefix: { type: String, required: true, default: '$' },
  MuteRole: { type: String, required: true }
});

module.exports = mongoose.model('ServerSettings', ServerSettingsSchema)