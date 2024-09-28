const express = require('express');
const bodyParser = require('body-parser');
const { getRecipes, interpretVoice, insertFoodItems, removeFoodItem, getAllFromPantry } = require('./main');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

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
    await insertFoodItems(foodItems, userId);
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
    await removeFoodItem(foodItemName, userId);
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
    const pantryItems = await getAllFromPantry(userId);
    res.json(pantryItems);
  } catch (error) {
    console.error('Error fetching pantry items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

