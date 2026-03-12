const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');

router.post('/', journalController.createEntry);
router.get('/:userId', journalController.getEntries);
router.post('/analyze', journalController.analyzeText);
router.post('/analyze-stream', journalController.analyzeTextStream);
router.get('/insights/:userId', journalController.getInsights);

module.exports = router;
