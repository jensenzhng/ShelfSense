const axios = require('axios');

const API_KEY = '8aebfb1719074b5c93c16e3fb150a647'; // Replace with your Spoonacular API key

const ingredients = 'apples,flour,sugar';
const numberOfRecipes = 2;

const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=${numberOfRecipes}&apiKey=${API_KEY}`;

axios.get(url)
  .then((response) => {
    console.log('Recipes found:', response.data);
  })
  .catch((error) => {
    console.error('Error fetching recipes:', error);
  });