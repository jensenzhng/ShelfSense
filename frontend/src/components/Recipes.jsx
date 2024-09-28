import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Recipes = () => {
    const [ingredients, setIngredients] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch ingredients from the server
    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const response = await axios.get('http://localhost:3000/pantry?userId=ankit.roy');
                setIngredients(response.data);
            } catch (error) {
                console.error('Error fetching ingredients:', error);
            }
        };

        fetchIngredients();
    }, []);

    // Once ingredients are fetched, fetch recipes using those ingredients
    useEffect(() => {
        if (ingredients.length > 0) {
            const fetchRecipes = async () => {
                const ingredientList = ingredients.map(ingredient => ingredient.foodItem).join(',');
                try {
                    const response = await axios.get('http://localhost:3000/recipes', {
                        params: {
                            ingredients: ingredientList,
                            numberOfRecipes: 10, // Set the number of recipes to retrieve
                        },
                    });
                    setRecipes(response.data);
                } catch (error) {
                    console.error('Error fetching recipes:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchRecipes();
        }
    }, [ingredients]);

    if (loading) {
        return <p>Loading recipes...</p>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Recipes</h1>
            {recipes.length === 0 ? (
                <p>No recipes found. Try adding more ingredients to your pantry.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                        <div key={recipe.id} className="border p-4 rounded shadow-md">
                            <h2 className="text-xl font-semibold mb-2">{recipe.title}</h2>
                            <img src={recipe.image} alt={recipe.title} className="w-full h-40 object-cover mb-2" />
                            <div className="text-sm mb-2">
                                <strong>Used Ingredients:</strong>
                                <ul className="list-disc pl-4">
                                    {recipe.usedIngredients.map((ingredient) => (
                                        <li key={ingredient.id}>
                                            {ingredient.amount} {ingredient.unitShort} {ingredient.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="text-sm mb-2">
                                <strong>Missed Ingredients:</strong>
                                <ul className="list-disc pl-4">
                                    {recipe.missedIngredients.map((ingredient) => (
                                        <li key={ingredient.id}>
                                            {ingredient.amount} {ingredient.unitShort} {ingredient.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <p className="text-sm text-gray-600">Likes: {recipe.likes}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Recipes;
