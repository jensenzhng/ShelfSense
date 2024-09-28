const axios = require('axios');
require('dotenv').config();
const OpenAI = require('openai');
const { MongoClient } = require('mongodb');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const SPOONACULAR_API_KEY= process.env.SPOONACULAR_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // your Gmail address
        pass: process.env.EMAIL_PASS   // your Gmail password or app-specific password
    }
});

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

async function checkForExpiring(userId, db) {

    try {
        const collection = db.collection("USERS");

        const currentDate = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(currentDate.getDate() + 3);

        const user = await collection.findOne(
            { username: userId }, 
            { projection: { pantry: 1, email: 1} } // Retrieve pantry, email
        );

        if (!user || !user.pantry) {
            console.log(`User with username ${userId} not found or no pantry data.`);
            return;
        }

        const expiringItems = user.pantry.filter(item => {
            const itemExpirationDate = new Date(item.expirationDate); // Convert string to Date object
            return itemExpirationDate <= thresholdDate && itemExpirationDate >= currentDate; // Expiring soon
        });

        const expiredItems = user.pantry.filter(item => {
            const itemExpirationDate = new Date(item.expirationDate); // Convert string to Date object
            return itemExpirationDate < currentDate; // Already expired
        });

        if (expiringItems.length === 0 && expiredItems.length === 0) {
            console.log(`No expiring or expired items for user: ${userId}`);
            return;
        }

        let emailText = `Hello ${userId},\n\n`;
        if (expiringItems.length > 0) {
            const expiringList = expiringItems.map(item => `${item.foodItem} (expires on ${item.expirationDate})`).join('\n');
            emailText += `The following food items in your pantry are expiring soon:\n\n${expiringList}\n\n`;
        }

        if (expiredItems.length > 0) {
            const expiredList = expiredItems.map(item => `${item.foodItem} (expired on ${item.expirationDate})`).join('\n');
            emailText += `The following food items have already expired:\n\n${expiredList}\n\n`;
        }

        emailText += `Best,\nShelfSense`;

        // Construct email content
        const foodList = expiringItems.map(item => `${item.foodItem} (expires on ${item.expirationDate})`).join('\n');
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,  // User's email address
            subject: 'Food Expiration Reminder',
            text: emailText
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Error occurred:', error);
            }
            console.log('Email sent successfully:', info.response);
        });
        console.log(`Expiration email sent to ${user.email}`);

    } catch (error) {
        console.error("Error occurred during expiration check:", error);
    }

}


(async() => {
    // const jsonObject = await interpretVoice('3 apples, a can of tomato soup, 5 cloves of garlic, a pint of milk');

    // insertFoodItems(jsonObject);
    //console.log(await getAllFromPantry("ankit.roy"));
    // console.log(await getRecipes('apples,peaches,oranges', 5));
    
    // const mongoClient = new MongoClient(process.env.MONGO_CONNECTION);
    // await mongoClient.connect();
    // console.log('Connected to MongoDB');
    // db = mongoClient.db("ShelfSense");
    // await checkForExpiring("ankit.roy", db);
    // mongoClient.close();
})();

module.exports = { getRecipes, interpretVoice, insertFoodItems, removeFoodItem, getAllFromPantry, checkForExpiring };