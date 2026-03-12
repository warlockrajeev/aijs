const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
    "gemini-2.5-flash", 
    "gemini-2.5-pro", 
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash", 
    "gemini-1.5-flash", 
    "gemini-1.5-pro", 
    "gemini-pro"
];

const analyzeWithModel = async (modelName, text) => {
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `
You are an AI that analyzes personal journal entries and explains the user's emotional state.

Your task is to interpret the feelings behind the journal entry, not repeat the sentence.

Return ONLY a valid JSON object with these keys:
"emotion"
"keywords"
"summary"

Rules:
- Emotion must be a single word describing the dominant feeling.
- Keywords should contain 3–5 meaningful themes from the text.
- Summary must explain the user's emotional experience in a natural way.
- Do NOT repeat the original sentence.
- Do NOT copy phrases directly from the text.
- The summary should interpret the feeling and context.

Example output:

{
  "emotion": "calm",
  "keywords": ["rain", "nature", "relaxation", "peace"],
  "summary": "The user experienced a sense of calm and mental relaxation while listening to soothing rain sounds in nature."
}

Journal entry:
"${text}"
`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resultText = response.text();
    const cleanedText = resultText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedText);
};

const analyzeJournalText = async (text) => {
    let lastError = null;
    
    for (const modelName of MODELS) {
        try {
            console.log(`Attempting analysis with model: ${modelName}`);
            const result = await analyzeWithModel(modelName, text);
            return result;
        } catch (error) {
            console.error(`Error with model ${modelName}:`, error.message);
            lastError = error;
            continue; // Try next model
        }
    }
    
    throw new Error(`All Gemini models failed. Last error: ${lastError?.message}`);
};

module.exports = { analyzeJournalText };
