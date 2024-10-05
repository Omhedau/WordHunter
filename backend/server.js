// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3000;

// Initialize the API client with your API key
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Middleware setup
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for all routes

// Define the API endpoint for word definitions
app.post('/api/define', async (req, res) => {
  const word = req.body.word;

  // Validate the input
  if (!word || word.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide a word.' });
  }

  const wordCount = word.trim().split(/\s+/).length;
  if (wordCount > 2) {
    return res.status(400).json({ error: 'Please provide one or two words.' });
  }

  // Create the prompt for the Gemini API
  const prompt = `Provide an easy-to-understand definition for the word "${word}" in 25 words or less. Format the response as follows in markdown:\n\nDef: Definition of the word\n\nEx: Example sentence using the word.`;

  try {
    // Generate content based on the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Parse the text into definition and example
    const definitionMatch = text.match(/Def:\s*(.*?)(?=\n\n|$)/s);
    const exampleMatch = text.match(/Ex:\s*(.*)/s);

    const definition = definitionMatch ? definitionMatch[1].trim() : 'Definition not found.';
    const example = exampleMatch ? exampleMatch[1].trim() : 'Example not found.';

    // Send the parsed response to the client
    res.json({ definition, example });
  } catch (error) {
    console.error('Error generating definition:', error);
    res.status(500).json({ error: 'Failed to generate the definition.' });
  }
});

// Define the new API endpoint for detailed word information
app.post('/api/word-info', async (req, res) => {
  const word = req.body.word;

  // Validate the input
  if (!word || word.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide a word.' });
  }

  const wordCount = word.trim().split(/\s+/).length;
  if (wordCount > 2) {
    return res.status(400).json({ error: 'Please provide one or two words.' });
  }

  // Create the prompt for the Gemini API
  const prompt = `Provide a comprehensive explanation for the word "${word}". The response should include in markdown:
  
  - **Definition(s)**: Clearly explain what the word means and its parts of speech + extra variations of it.
  - **differnt meanings**: with example of each with context
  - **Synonyms**: comma seprated List words with similar meanings to help broaden understanding.
  - **Antonyms**: comma seprated List words with opposite meanings to give a fuller context.
  - **Usage in Daily Life**: Provide examples of how this word can be used in everyday conversations or situations.
  - **Memorable Insight**: Share a unique or unusual fact about the word or a mnemonic aid that makes it easier to remember.
  
  Think of a way to make the word stick in the user’s mind—perhaps through an interesting analogy, a quirky fact, or a vivid image related to the word's meaning. The goal is to make the word unforgettable and its usage clear. for fromatating apply your logic which lokk beautiful`;
  try {
    // Generate content based on the prompt
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    // Send the raw response from the AI to the client
    res.json({ text });
  } catch (error) {
    console.error('Error generating word info:', error);
    res.status(500).json({ error: 'Failed to generate the word information.' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
