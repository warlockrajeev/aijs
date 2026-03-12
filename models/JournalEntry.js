const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    ambience: { type: String, required: true },
    text: { type: String, required: true },
    emotion: { type: String },
    keywords: [{ type: String }],
    summary: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
