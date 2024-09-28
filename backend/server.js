const express = require('express');
const bodyParser = require('body-parser');
const { getRecipes, interpretVoice, insertFoodItems, removeFoodItem, getAllFromPantry } = require('./main');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let db; // This will hold the database connection

// Connect to MongoDB and start the server only after connection is established
const mongoClient = new MongoClient(process.env.MONGO_CONNECTION);

async function connectToMongoDB() {
  try {
    console.log('Connecting to MongoDB');
    
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    db = mongoClient.db("ShelfSense"); // Specify the database to use
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit the application if unable to connect
  }
}

// Middleware to ensure MongoDB connection is available in every route
app.use((req, res, next) => {
  if (!db) {
    return res.status(500).json({ error: 'Database connection not available' });
  }
  req.db = db; // Attach the db connection to the request object
  next();
});

app.get('/recipes', async (req, res) => {
  try {
    const { ingredients, numberOfRecipes } = req.query;
    if (!ingredients || !numberOfRecipes) {
      return res.status(400).json({ error: 'Ingredients and numberOfRecipes are required' });
    }
    const recipes = await getRecipes(ingredients, numberOfRecipes);
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/interpret-voice', async (req, res) => {
  try {
    const { speechInput } = req.body;
    if (!speechInput) {
      return res.status(400).json({ error: 'speechInput is required' });
    }
    const interpretedData = await interpretVoice(speechInput);
    res.json(interpretedData);
  } catch (error) {
    console.error('Error interpreting voice:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/pantry', async (req, res) => {
  try {
    const { userId, foodItems } = req.body;
    if (!userId || !foodItems) {
      return res.status(400).json({ error: 'userId and foodItems are required' });
    }
    await insertFoodItems(foodItems, userId, req.db); // Pass the db connection
    res.status(200).json({ message: 'Food items inserted successfully' });
  } catch (error) {
    console.error('Error inserting food items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/pantry', async (req, res) => {
  try {
    const { userId, foodItemName } = req.body;
    if (!userId || !foodItemName) {
      return res.status(400).json({ error: 'userId and foodItemName are required' });
    }
    await removeFoodItem(foodItemName, userId, req.db); // Pass the db connection
    res.status(200).json({ message: 'Food item removed successfully' });
  } catch (error) {
    console.error('Error removing food item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/pantry', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const pantryItems = await getAllFromPantry(userId, req.db); // Pass the db connection
    res.json(pantryItems);
  } catch (error) {
    console.error('Error fetching pantry items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server after MongoDB connection is established
connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

