import { useState } from "react";
import { useVoiceToText } from "react-speakup";
import axios from "axios";
import { useEffect } from "react";

function ShelfSense() {
    const [inputValue, setInputValue] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("");
    const [expirationDate, setExpirationDate] = useState("");
    const [ingredients, setIngredients] = useState([]);
    const [editIndex, setEditIndex] = useState(null); // Track which ingredient is being edited
    const [editValue, setEditValue] = useState({
        foodItem: "",
        quantity: "",
        unit: "",
        expirationDate: "",
    });

    useEffect(() => {
        const fetchPantryData = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:3000/pantry?userId=ankit.roy"
                );

                // Assuming response.data is an array of pantry items with an 'expirationDate' field in 'mm/dd/yyyy' format
                const sortedIngredients = response.data.sort((a, b) => {
                    const dateA = new Date(a.expirationDate);
                    const dateB = new Date(b.expirationDate);
                    return dateA - dateB; // Sort in ascending order, the closest expiration date first
                });

                // Set the sorted ingredients
                setIngredients(sortedIngredients);
            } catch (error) {
                console.error("Error fetching pantry data:", error);
            }
        };

        fetchPantryData();
    }, []); // Fetch pantry data only once when the component mounts

    const { startListening, stopListening, transcript, reset } =
        useVoiceToText();

    const [isListening, setIsListening] = useState(false);

    const handleTranscriptAdd = async () => {
        if (transcript.trim() !== "") {
            try {
                const response = await axios.post(
                    "http://localhost:3000/interpret-voice",
                    {
                        speechInput: transcript,
                    }
                );

                if (response.status === 200) {
                    console.log("Interpreted data:", response.data);
                    const interpretedItems = response.data;

                    const newIngredients = interpretedItems.map((item) => ({
                        foodItem: item.foodItem,
                        quantity: item.quantity,
                        unit: item.unit,
                        expirationDate: item.expirationDate,
                    }));

                    const response2 = await axios.post(
                        "http://localhost:3000/pantry",
                        {
                            userId: "ankit.roy",
                            foodItems: newIngredients,
                        }
                    );

                    if (response2.status === 200) {
                        console.log(
                            "Food item added successfully:",
                            response2.data
                        );

                        // Sort the ingredients by expiration date after adding
                        const updatedIngredients = [
                            ...ingredients,
                            ...newIngredients,
                        ].sort((a, b) => {
                            const dateA = new Date(a.expirationDate);
                            const dateB = new Date(b.expirationDate);
                            return dateA - dateB;
                        });

                        // Update the state with sorted ingredients
                        setIngredients(updatedIngredients);
                        reset(); // Reset the transcript after adding
                    } else {
                        console.error(
                            "Failed to add the food item:",
                            response2.data
                        );
                    }
                } else {
                    console.error("Failed to interpret voice:", response.data);
                }
            } catch (error) {
                console.error("Error interpreting voice:", error);
            }
        }
    };

    const handleAdd = async () => {
        if (
            inputValue.trim() !== "" &&
            quantity.trim() !== "" &&
            unit.trim() !== "" &&
            expirationDate.trim() !== ""
        ) {
            let date = new Date(expirationDate);
            const formattedDate = `${date.getMonth() + 1}/${
                date.getDate() + 1
            }/${date.getFullYear()}`;

            const newIngredient = {
                foodItem: inputValue,
                quantity,
                expirationDate: formattedDate,
                unit,
            };

            try {
                const response = await axios.post(
                    "http://localhost:3000/pantry",
                    {
                        userId: "ankit.roy",
                        foodItems: [newIngredient],
                    }
                );

                if (response.status === 200) {
                    console.log("Food item added successfully:", response.data);

                    // Sort the ingredients by expiration date after adding
                    const updatedIngredients = [
                        ...ingredients,
                        newIngredient,
                    ].sort((a, b) => {
                        const dateA = new Date(a.expirationDate);
                        const dateB = new Date(b.expirationDate);
                        return dateA - dateB;
                    });

                    // Update the state with sorted ingredients
                    setIngredients(updatedIngredients);
                } else {
                    console.error(
                        "Failed to add the food item:",
                        response.data
                    );
                }
            } catch (error) {
                console.error("Error adding food item:", error);
            }

            // Clear the input fields after adding
            setUnit("");
            setInputValue("");
            setQuantity("");
            setExpirationDate("");
        }
    };

    const handleDelete = async (index) => {
        const foodItemToDelete = ingredients[index].foodItem; // Get the foodItem from the ingredient

        try {
            // Make a DELETE request to the server to delete the food item
            const response = await axios.delete(
                "http://localhost:3000/pantry",
                {
                    data: {
                        userId: "ankit.roy", // Replace this with dynamic userId if needed
                        foodItemName: foodItemToDelete,
                    },
                }
            );

            if (response.status === 200) {
                console.log("Food item removed successfully:", response.data);
                // Update local state only if the delete request was successful
                const newIngredients = ingredients.filter(
                    (_, i) => i !== index
                );
                setIngredients(newIngredients);
            } else {
                console.error("Failed to remove the food item:", response.data);
            }
        } catch (error) {
            console.error("Error removing food item:", error);
        }
    };

    const handleEditClick = (index) => {
        const ingredientToEdit = ingredients[index];
        const expirationDate = new Date(ingredientToEdit.expirationDate);
        const formattedExpirationDate = expirationDate
            .toISOString()
            .split("T")[0]; // Convert to YYYY-MM-DD format

        setEditIndex(index);
        setEditValue({
            foodItem: ingredientToEdit.foodItem,
            quantity: ingredientToEdit.quantity,
            unit: ingredientToEdit.unit,
            expirationDate: formattedExpirationDate, // Set formatted date
        });
    };

    const handleEditChange = (e) => {
        setEditValue({
            ...editValue,
            [e.target.name]: e.target.value,
        });
    };

    const handleSaveEdit = async (index) => {
        const ingredientToEdit = ingredients[index];

        const updatedItem = {
            foodItem: editValue.foodItem,
            quantity: editValue.quantity,
            unit: editValue.unit,
            expirationDate: editValue.expirationDate,
        };

        try {
            const response = await axios.post(
                "http://localhost:3000/editPantry",
                {
                    userId: "ankit.roy", // Replace with dynamic userId if needed
                    foodName: ingredientToEdit.foodItem,
                    updatedItem,
                }
            );

            if (response.status === 200) {
                console.log("Food item updated successfully:", response.data);

                // Update the ingredients list with the updated item
                const updatedIngredients = ingredients.map((ingredient, i) =>
                    i === index ? updatedItem : ingredient
                );

                updatedIngredients.sort((a, b) => {
                    const dateA = new Date(a.expirationDate);
                    const dateB = new Date(b.expirationDate);
                    return dateA - dateB; // Sort in ascending order, the closest expiration date first
                });
                setIngredients(updatedIngredients);
                setEditIndex(null); // Exit edit mode
            } else {
                console.error("Failed to update the food item:", response.data);
            }
        } catch (error) {
            console.error("Error updating food item:", error);
        }
    };

    const handleMicrophoneClick = () => {
        if (isListening) {
            stopListening();
            setIsListening(false);
        } else {
            startListening();
            setIsListening(true);
        }
    };

    return (
        <>
            <div className="flex flex-col items-center my-10 px-8">
                <div className="flex space-x-2 mb-4 max-w-2xl w-full">
                    <input
                        type="text"
                        className="border border-gray-300 rounded-lg p-2 w-full"
                        placeholder="Enter ingredient"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <input
                        type="number"
                        className="border border-gray-300 rounded-lg p-2 w-24"
                        placeholder="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />
                    <input
                        type="text"
                        className="border border-gray-300 rounded-lg p-2 w-16"
                        placeholder="Unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                    />
                    <input
                        type="date"
                        className="border border-gray-300 rounded-lg p-2 w-48"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                    />
                    <button
                        onClick={handleAdd}
                        className="bg-[#386c5f] text-white px-4 py-2 rounded-lg"
                    >
                        Add
                    </button>
                </div>

                <div className="flex items-center justify-center w-full max-w-2xl my-2">
                    <hr className="border-gray-300 w-full" />
                    <span className="px-2 text-gray-500">or</span>
                    <hr className="border-gray-300 w-full" />
                </div>

                <div className="flex space-x-2 mt-4">
                    <button
                        onClick={handleMicrophoneClick}
                        className={`text-white px-4 py-2 rounded-lg ${
                            isListening ? "bg-red-500" : "bg-gray-400"
                        }`}
                    >
                        {isListening ? "Stop Recording" : "Start Recording"}
                    </button>

                    <button
                        onClick={reset}
                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                    >
                        Reset Transcript
                    </button>

                    <button
                        onClick={handleTranscriptAdd}
                        className="bg-[#386c5f] text-white px-4 py-2 rounded-lg"
                    >
                        Add
                    </button>
                </div>

                {transcript && (
                    <div className="max-w-2xl mt-2">
                        <span>
                            <strong>You said:</strong>
                        </span>
                        <span className="mt-4 text-gray-700">
                            {transcript}
                        </span>
                    </div>
                )}

                <div className="space-y-3 w-full max-w-2xl mt-4">
                    {ingredients.map((ingredient, index) => {
                        const expirationDate = new Date(
                            ingredient.expirationDate
                        );
                        const today = new Date();
                        const threeDaysFromNow = new Date();
                        threeDaysFromNow.setDate(today.getDate() + 3);

                        const timeDifference =
                            expirationDate.getTime() - today.getTime();
                        const daysDifference = Math.ceil(
                            timeDifference / (1000 * 3600 * 24)
                        );

                        const borderColor =
                            expirationDate < today
                                ? "border-red-500"
                                : expirationDate <= threeDaysFromNow
                                ? "border-yellow-500"
                                : "border-gray-300";

                        return (
                            <div
                                key={index}
                                className={`flex justify-between items-center border border-2 ${borderColor} rounded-lg p-3`}
                            >
                                {editIndex === index ? (
                                    <div className="flex flex-col space-y-2">
                                        <p className="text-[#212427] font-bold text-base md:text-lg">
                                            {ingredient.foodItem
                                                .charAt(0)
                                                .toUpperCase() +
                                                ingredient.foodItem.slice(1)}
                                        </p>
                                        <input
                                            type="number"
                                            name="quantity"
                                            className="border border-gray-300 rounded-lg p-2 w-24"
                                            value={editValue.quantity}
                                            onChange={handleEditChange}
                                        />
                                        <input
                                            type="text"
                                            name="unit"
                                            className="border border-gray-300 rounded-lg p-2 w-16"
                                            value={editValue.unit}
                                            onChange={handleEditChange}
                                        />
                                        <input
                                            type="date"
                                            name="expirationDate"
                                            className="border border-gray-300 rounded-lg p-2 w-48"
                                            value={editValue.expirationDate}
                                            onChange={handleEditChange}
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-[#212427] font-bold text-base md:text-lg">
                                            {ingredient.foodItem
                                                .charAt(0)
                                                .toUpperCase() +
                                                ingredient.foodItem.slice(1)}
                                        </p>
                                        <p className="text-gray-500 text-sm md:text-base">
                                            {ingredient.quantity}{" "}
                                            {ingredient.unit} • Expires{" "}
                                            {ingredient.expirationDate}
                                            {expirationDate < today && (
                                                <span className="text-red-600">
                                                    {" "}
                                                    (expired{" "}
                                                    {Math.abs(
                                                        daysDifference
                                                    )}{" "}
                                                    {Math.abs(
                                                        daysDifference
                                                    ) === 1
                                                        ? "day"
                                                        : "days"}{" "}
                                                    ago)
                                                </span>
                                            )}
                                            {expirationDate <=
                                                threeDaysFromNow &&
                                                expirationDate >= today && (
                                                    <span className="text-yellow-600">
                                                        {" "}
                                                        (in {
                                                            daysDifference
                                                        }{" "}
                                                        {daysDifference === 1
                                                            ? "day"
                                                            : "days"}
                                                        )
                                                    </span>
                                                )}
                                        </p>
                                    </div>
                                )}

                                <div className="flex space-x-2">
                                    {editIndex === index ? (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleSaveEdit(index)
                                                }
                                                className="bg-green-500 text-white px-4 py-2 rounded-lg"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setEditIndex(null)
                                                }
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() =>
                                                    handleEditClick(index)
                                                }
                                                className="bg-[#72b7d6] text-white px-4 py-2 rounded-lg"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(index)
                                                }
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default ShelfSense;
