const axios = require('axios');
require('dotenv').config();
const OpenAI = require('openai');

const SPOONACULAR_API_KEY= process.env.SPOONACULAR_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const gptClient = new OpenAI({
    apiKey: OPENAI_API_KEY, // This is the default and can be omitted
  });


async function getRecipes(ingredients, numberOfRecipes) {
  const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=${numberOfRecipes}&apiKey=${SPOONACULAR_API_KEY}`;

  const response = await axios.get(url);
  return response.data;
}

async function interpretVoice(speechInput) {

    const now = new Date();

    const formattedDate = `${now.getMonth() + 1}/${now.getDate() + 1}/${now.getFullYear()}`;

    const stream = await gptClient.chat.completions.create({
        messages: [{ role: 'user', content: 'I will give you a phrase containing a food item, quantity, unit, and an expiration date.' + 
            'If there is no expiration date, make an estimation of the approximate expiration date of that food. If no explicit units, write "count". The current date is ' + formattedDate +
            '. Return ONLY a JSON Array with a JSON object for each food in the format: [{"foodItem": <String>, "quantity": <Int>, "unit": <String>, "expirationDate": <mm/dd/yyyy>}]. ' +
            'Here is the phrase: ' + speechInput }],
        model: 'gpt-3.5-turbo',
        stream: true
      });

      var response = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
            response += content; // Only append if content is not undefined
        }
      }

      try {
        const jsonResponse = JSON.parse(response.trim());
        if (Array.isArray(jsonResponse)) {
            console.log(jsonResponse);
            return jsonResponse;
        } else {
            throw new Error("Parsed JSON is not an array");
        }
      } catch (error) {
        console.error("Failed to parse JSON:", error);
        throw new Error("Invalid JSON response");
      }
}

async function insertFoodItems(jsonFoodItems, userId, db) { 
    try { 
        const collection = db.collection("USERS");
    

        for(item of jsonFoodItems) {
            const foodItem = {
                foodItem: item.foodItem,
                quantity: item.quantity,
                unit: item.unit,
                expirationDate: item.expirationDate
            };

            await collection.updateOne(
                { username: userId },  // Find the user by their ID
                { $push: { pantry: foodItem } }  // Push the foodItem to the pantry array
            );
        }
    } catch (error) {
        console.error("Error occurred:", error);
    } 
}


async function removeFoodItem(foodItemName, userId, db) { 

    try { 
        const collection = db.collection("USERS");

        // Use $pull to remove the item from the pantry array
        const result = await collection.updateOne(
            { username: userId },  // Find the user by their ID
            { $pull: { pantry: { foodItem: foodItemName } } }  // Remove the foodItem from the pantry
        );

    } catch (error) {
        console.error("Error occurred:", error);
    }
}

async function getAllFromPantry(userId, db) { 
    console.log("Getting all from pantry");
    try { 
        const collection = db.collection("USERS");

        // Use $pull to remove the item from the pantry array
        const user = await collection.findOne(
            { username: userId }, 
            { projection: { pantry: 1 } }  // Only return the pantry field
        );
        console.log(user.pantry);
        return user.pantry || [];

    } catch (error) {
        console.error("Error occurred:", error);
    } 
}


// (async() => {
//     // const jsonObject = await interpretVoice('3 apples, a can of tomato soup, 5 cloves of garlic, a pint of milk');

//     // insertFoodItems(jsonObject);
//     console.log(await getAllFromPantry("ankit.roy"));
//     // console.log(await getRecipes('apples,peaches,oranges', 5));
// })();

module.exports = { getRecipes, interpretVoice, insertFoodItems, removeFoodItem, getAllFromPantry };