const axios = require('axios');

const API_KEY = 'fasdfds'; // Replace with your Spoonacular API key

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