# Inspiration

The idea for ShelfSense was born from a commitment to solving a common household problem: food waste. Countless people find themselves with unused ingredients, leading to spoiled food or falling into the habit of cooking the same recipes over and over again. We wanted to build a solution that turns these overlooked items into an opportunity to explore new culinary experiences, all while minimizing food waste. Inspired by sustainability and creativity, ShelfSense empowers users to see their kitchens in a new light, making every ingredient count and every meal an adventure.

# What it does
ShelfSense is an intelligent assistant that transforms your pantry into a dynamic culinary resource. Users can simply speak to the app, listing available ingredients and their quantities, and ShelfSense will generate a curated selection of recipes that make the best use of what’s on hand. The app not only suggests recipes but also tracks ingredient availability, sending notifications when items are nearing expiration. ShelfSense even emails recipes for safekeeping, allowing users to plan meals in advance or save favorites for future use. With real-time updates, automated email notifications, and ingredient tracking, ShelfSense provides a holistic approach to home cooking that is both efficient and environmentally friendly.

# How we built it
We built ShelfSense using the MERN stack—MongoDB, Express, React, and Node.js—to create a scalable and responsive application. Voice recognition and natural language processing (NLP) were integrated to support hands-free interaction. The front end, built with React, offers a clean and intuitive user experience, while the backend, powered by Node.js and Express, ensures efficient data handling and communication between different modules. MongoDB serves as the database to store user data, recipes, and ingredient inventories, allowing for quick and seamless retrieval. To address speech-to-text input variations, we fine-tuned a language model (LLM) to enhance contextual understanding and accuracy when determining ingredients from transcribed audio. This improvement allowed us to overcome limitations with existing APIs and deliver a more tailored experience. The app’s email notification system is built using a personal email server prototype, which required careful security configurations to ensure proper functionality and safe interactions.

# Challenges we ran into
-**Speech Input Variability**: We initially faced challenges with speech input inconsistencies that didn’t match the expected format of existing APIs. This required us to fine-tune a custom language model for contextually aware semantic reasoning, enhancing accuracy and efficiency. 
- **Email Integration Security**: Sending automated emails for ingredient expiration notifications proved to be difficult during prototyping. We had to adjust security settings on our email server to accommodate these requirements, while still maintaining a secure environment.
- **Real-Time Updates and Tracking**: Implementing real-time updates to ingredient inventories and generating live recipe suggestions required us to optimize data handling and state management to avoid lags and maintain a smooth user experience.

# Accomplishments that we're proud of
We’re proud of successfully creating an application that blends cutting-edge technology with practical usability to make a positive environmental impact. We fine-tuned a custom language model that significantly improved speech-to-text recognition, enabling ShelfSense to better understand user inputs. We also built an effective system for real-time updates and notifications that keeps the app responsive and useful. Most importantly, we’re proud to have developed a tool that addresses a real-world problem in a way that encourages people to cook more creatively and sustainably.

# What we learned
This project taught us the importance of bridging the gap between technology and real-world needs. We gained experience in working with voice recognition, model fine-tuning, and complex state management. We also learned how to effectively deploy scalable, responsive web applications while integrating third-party services like email and browser APIs.

# What's next for ShelfSense
Moving forward, we plan to expand ShelfSense’s capabilities by introducing community-driven features that allow users to share their own recipes and tips, fostering a collaborative environment for cooking enthusiasts. Additionally, we’re looking to implement nutritional information to provide even more value to users seeking to make informed dietary choices. ShelfSense isn't just a recipe assistant—it’s a platform that turns every kitchen into a place of discovery, sustainability, and delicious possibilities.

# Built With
- express.js
- llm
- mongodb
- node.js
- react
- tailwind
