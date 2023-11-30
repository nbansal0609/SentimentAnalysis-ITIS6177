// Import the required libraries
const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
const express = require("express");
require('dotenv').config();

const errorMessage = "Error occurred while analyzing the sentiment. Please try again!!";
const SENTIMENT_ROUTE = "/sentiment-analysis";

// Add endpoint and key
const endpoint = process.env.ENDPOINT;
const textAnalyticsApiKey = process.env.KEY;

// Create a new TextAnalyticsClient object using the endpoint and key
const client = new TextAnalyticsClient(endpoint, new AzureKeyCredential(textAnalyticsApiKey));

// Create a new Express app and parse incoming JSON requests
const app = express();
app.use(express.json());

// Define a route to handle POST requests to '/sentiment-analysis'
app.post(SENTIMENT_ROUTE, async (req, res) => {
  // Extract the 'sentence' parameter from the request body
  const { sentence } = req.body;

  // Return a 400 error if 'sentence' parameter is missing
  if (!sentence) {
    return res.status(400).json({ error: "Please add missing 'sentence' parameter" });
  }

  // Create an array of documents to analyze, with one document containing the input
  const documents = [{ id: "1", language: "en", text: sentence }];

  // Prepare response payload
  const responsePayload = { input: sentence };

  try {
    // Call the analyzeSentiment method on the TextAnalyticsClient object to analyze the sentiment of the input 'sentence'
    const [sentimentAnalysisResult] = await client.analyzeSentiment(documents);
    console.log("Sentiment analysis result:", sentimentAnalysisResult);

    const { sentiment, confidenceScores } = sentimentAnalysisResult;
    responsePayload['sentimentResult'] = sentiment || errorMessage;
    responsePayload['sentimentScores'] = confidenceScores || errorMessage;

    res.send(responsePayload);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send({ error: errorMessage });
  }
});

// Start server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
