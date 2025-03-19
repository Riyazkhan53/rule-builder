const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for frontend-backend communication

// POST endpoint to fetch template data
app.post("/fetch-template", async (req, res) => {
  const { uri, databaseName, collectionName, templateId } = req.body;

  if (!uri || !databaseName || !collectionName || !templateId) {
    return res.status(400).json({ error: "Missing required fields in the request body." });
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    // Query the collection for the template with the given template_id
    const template = await collection.findOne({ template_id: templateId });

    if (!template) {
      return res.status(404).json({ error: "Template not found." });
    }

    res.json({ co: template });
    await client.close();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).json({ error: "Failed to connect to MongoDB." });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});