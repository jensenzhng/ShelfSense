const axios = require('axios');
require('dotenv').config();
const OpenAI = require('openai');
const { MongoClient } = require('mongodb');

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

    const formattedDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;

    const stream = await gptClient.chat.completions.create({
        messages: [{ role: 'user', content: 'I will give you a phrase containing a food item, quanity, unit, and an expiration date.' + 
            'If there is no expiration date, make an estimation. If no explicit units, write "count". The current date is ' + formattedDate +
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

async function insertFoodItems(jsonFoodItems) { 

    const mongoClient = new MongoClient(process.env.MONGO_CONNECTION);

    try { 
        await mongoClient.connect();

        for(item of jsonFoodItems) {
            const foodItem = {
                foodItem: item.foodItem,
                quantity: item.quantity,
                unit: item.unit,
                expirationDate: item.expirationDate
            };
    
            const db = mongoClient.db("ShelfSense");
            const collection = db.collection("USERS");
    
            await collection.updateOne(
                { username: "ankit.roy" },  // Find the user by their ID
                { $push: { pantry: foodItem } }  // Push the foodItem to the pantry array
            );
        }
    } catch (error) {
        console.error("Error occurred:", error);
    } finally {
        await mongoClient.close();  // Ensure the client is closed
        console.log("Connection closed");
    }
}


async function removeFoodItem(foodItem) { 

    const mongoClient = new MongoClient(process.env.MONGO_CONNECTION);

    try { 
        await mongoClient.connect();

        for(item of jsonFoodItems) {
            const foodItem = {
                foodItem: item.foodItem,
                quantity: item.quantity,
                unit: item.unit,
                expirationDate: item.expirationDate
            };
    
            const db = mongoClient.db("ShelfSense");
            const collection = db.collection("USERS");
    
            await collection.updateOne(
                { username: "ankit.roy" },  // Find the user by their ID
                { $push: { pantry: foodItem } }  // Push the foodItem to the pantry array
            );
        }
    } catch (error) {
        console.error("Error occurred:", error);
    } finally {
        await mongoClient.close();  // Ensure the client is closed
        console.log("Connection closed");
    }
}


(async() => {
    const jsonObject = await interpretVoice('3 apples, a can of tomato soup, 5 cloves of garlic, a pint of milk');

    insertFoodItems(jsonObject);
    // console.log(await getRecipes('apples,peaches,oranges', 5));
})();