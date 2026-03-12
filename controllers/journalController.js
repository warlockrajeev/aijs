const JournalEntry = require('../models/JournalEntry');
const { analyzeJournalText } = require('../utils/gemini');
const NodeCache = require('node-cache');
const analysisCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

// POST /api/journal - Save entry
exports.createEntry = async (req, res) => {
    try {
        const { userId, ambience, text } = req.body;
        
        if (!userId || !ambience || !text) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Optional: Auto-analyze if fields aren't provided? 
        // For now, let's just save. The flow might require separate analysis.
        // But the requirement says save entry with fields: emotion, keywords, summary.
        // So we should analyze here.

        const analysis = await analyzeJournalText(text);

        const entry = new JournalEntry({
            userId,
            ambience,
            text,
            ...analysis
        });

        await entry.save();
        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/journal/:userId - Return all entries
exports.getEntries = async (req, res) => {
    try {
        const entries = await JournalEntry.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/journal/analyze - Input text, return analysis (doesn't save)
exports.analyzeText = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        // Caching
        const cachedResult = analysisCache.get(text);
        if (cachedResult) return res.json(cachedResult);

        const analysis = await analyzeJournalText(text);
        analysisCache.set(text, analysis);
        
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/journal/insights/:userId - Insights
exports.getInsights = async (req, res) => {
    try {
        const { userId } = req.params;
        const entries = await JournalEntry.find({ userId });

        if (!entries.length) {
            return res.json({
                totalEntries: 0,
                topEmotion: "None",
                mostUsedAmbience: "None",
                recentKeywords: []
            });
        }

        const emotions = {};
        const ambiences = {};
        let allKeywords = [];

        entries.forEach(e => {
            emotions[e.emotion] = (emotions[e.emotion] || 0) + 1;
            ambiences[e.ambience] = (ambiences[e.ambience] || 0) + 1;
            if (e.keywords) allKeywords = allKeywords.concat(e.keywords);
        });

        const topEmotion = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
        const mostUsedAmbience = Object.keys(ambiences).reduce((a, b) => ambiences[a] > ambiences[b] ? a : b);
        
        // Get top 5 unique recent keywords
        const uniqueKeywords = [...new Set(allKeywords)].slice(0, 5);

        res.json({
            totalEntries: entries.length,
            topEmotion,
            mostUsedAmbience,
            recentKeywords: uniqueKeywords
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
