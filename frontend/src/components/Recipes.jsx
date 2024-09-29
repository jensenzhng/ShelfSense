import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal"; // Import react-modal if you're using it

Modal.setAppElement("#root"); // Make sure this matches your root element

const Recipes = () => {
    const [ingredients, setIngredients] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [recipeDetails, setRecipeDetails] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch ingredients from the server
    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:3000/pantry?userId=ankit.roy"
                );
                setIngredients(response.data);
            } catch (error) {
                console.error("Error fetching ingredients:", error);
            }
        };

        fetchIngredients();
    }, []);

    // Once ingredients are fetched, fetch recipes using those ingredients
    useEffect(() => {
        if (ingredients.length > 0) {
            const fetchRecipes = async () => {
                const ingredientList = ingredients
                    .map((ingredient) => ingredient.foodItem)
                    .join(",");
                try {
                    const response = await axios.get(
                        "http://localhost:3000/recipes",
                        {
                            params: {
                                ingredients: ingredientList,
                                numberOfRecipes: 10, // Set the number of recipes to retrieve
                            },
                        }
                    );
                    setRecipes(response.data);
                } catch (error) {
                    console.error("Error fetching recipes:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchRecipes();
        }
    }, [ingredients]);

    // Fetch the recipe details when a recipe is selected
    const fetchRecipeDetails = async (recipeID) => {
        try {
            const response = await axios.get(
                `http://localhost:3000/getRecipeByID?recipeID=${recipeID}`
            );
            setRecipeDetails(response.data);
        } catch (error) {
            console.error("Error fetching recipe details:", error);
        }
    };

    // Open modal and fetch recipe details
    const openModal = (recipeId) => {
        setSelectedRecipe(recipeId);
        fetchRecipeDetails(recipeId);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setRecipeDetails(null);
    };

    if (loading) {
        return <p>Loading recipes...</p>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Recipes</h1>
            {recipes.length === 0 ? (
                <p>
                    No recipes found. Try adding more ingredients to your
                    pantry.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                        <div
                            key={recipe.id}
                            className="border p-4 rounded shadow-md cursor-pointer"
                            onClick={() => openModal(recipe.id)} // Open modal when clicked
                        >
                            <h2 className="text-xl font-semibold mb-2">
                                {recipe.title}
                            </h2>
                            <img
                                src={recipe.image}
                                alt={recipe.title}
                                className="w-full h-40 object-cover mb-2"
                            />
                            <div className="text-sm mb-2">
                                <strong>Used Ingredients:</strong>
                                <ul className="list-disc pl-4">
                                    {recipe.usedIngredients.map(
                                        (ingredient) => (
                                            <li key={ingredient.id}>
                                                {ingredient.amount}{" "}
                                                {ingredient.unitShort}{" "}
                                                {ingredient.name}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                            <div className="text-sm mb-2">
                                <strong>Missed Ingredients:</strong>
                                <ul className="list-disc pl-4">
                                    {recipe.missedIngredients.map(
                                        (ingredient) => (
                                            <li key={ingredient.id}>
                                                {ingredient.amount}{" "}
                                                {ingredient.unitShort}{" "}
                                                {ingredient.name}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                            <p className="text-sm text-gray-600">
                                Likes: {recipe.likes}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for displaying recipe details */}
            {recipeDetails && (
                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    contentLabel="Recipe Details"
                    className="modal"
                    overlayClassName="overlay"
                >
                    <div className="modal-header flex justify-between items-center">
                        <h2 className="text-xl font-bold">
                            {recipeDetails.title}
                        </h2>
                        <button
                            className="close-button text-red-500 text-lg font-bold"
                            onClick={closeModal}
                        >
                            &times;
                        </button>
                    </div>
                    <p>
                        <strong>Summary:</strong>{" "}
                        <span
                            dangerouslySetInnerHTML={{
                                __html: recipeDetails.summary,
                            }}
                        />
                    </p>
                    <h3 className="text-lg font-semibold mt-4">Ingredients:</h3>
                    <ul className="list-disc pl-4">
                        {recipeDetails.extendedIngredients.map((ingredient) => (
                            <li key={ingredient.id}>{ingredient.original}</li>
                        ))}
                    </ul>
                    <h3 className="text-lg font-semibold mt-4">
                        Instructions:
                    </h3>
                    <ol className="list-decimal pl-4">
                        {recipeDetails.analyzedInstructions[0]?.steps.map(
                            (step) => (
                                <li key={step.number}>{step.step}</li>
                            )
                        )}
                    </ol>
                    <button
                        className="mt-4 bg-red-500 text-white py-2 px-4 rounded"
                        onClick={closeModal}
                    >
                        Close
                    </button>
                </Modal>
            )}
        </div>
    );
};

export default Recipes;
