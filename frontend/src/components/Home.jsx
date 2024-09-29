import { useState } from "react";
import { useVoiceToText } from "react-speakup";
import axios from "axios";
import { useEffect } from "react";
import Header from "./Header";

function ShelfSense() {
    const [inputValue, setInputValue] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("");
    const [expirationDate, setExpirationDate] = useState("");
    const [ingredients, setIngredients] = useState([]);

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
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
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
                        className={`bg-gray-500 text-white px-4 py-2 rounded-lg ${
                            isListening ? "bg-red-500" : ""
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
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                        Add
                    </button>
                </div>

                {transcript && (
                    <p className="mt-4 text-gray-700">You said: {transcript}</p>
                )}

                <div className="space-y-3 w-full max-w-2xl mt-4">
                    {ingredients.map((ingredient, index) => {
                        const expirationDate = new Date(
                            ingredient.expirationDate
                        );
                        const today = new Date();
                        const threeDaysFromNow = new Date();
                        threeDaysFromNow.setDate(today.getDate() + 3);

                        // Calculate the number of days from or until expiration
                        const timeDifference =
                            expirationDate.getTime() - today.getTime();
                        const daysDifference = Math.ceil(
                            timeDifference / (1000 * 3600 * 24)
                        ); // Convert milliseconds to days

                        // Determine the border color
                        const borderColor =
                            expirationDate < today
                                ? "border-red-500" // Expired
                                : expirationDate <= threeDaysFromNow
                                ? "border-yellow-500" // Expiring in the next 3 days
                                : "border-gray-300"; // Otherwise gray

                        return (
                            <div
                                key={index}
                                className={`flex justify-between items-center border border-2 ${borderColor} rounded-lg p-3`}
                            >
                                <div>
                                    <p className="text-[#212427] font-bold text-base md:text-lg">
                                        {ingredient.foodItem
                                            .charAt(0)
                                            .toUpperCase() +
                                            ingredient.foodItem.slice(1)}
                                    </p>
                                    <p className="text-gray-500 text-sm md:text-base">
                                        {ingredient.quantity} {ingredient.unit}{" "}
                                        • Expires {ingredient.expirationDate}
                                        {/* Conditional rendering based on expiration status */}
                                        {expirationDate < today && (
                                            <span className="text-red-600">
                                                {" "}
                                                (expired{" "}
                                                {Math.abs(daysDifference)}{" "}
                                                {Math.abs(daysDifference) === 1
                                                    ? "day"
                                                    : "days"}{" "}
                                                ago)
                                            </span>
                                        )}
                                        {expirationDate <= threeDaysFromNow &&
                                            expirationDate >= today && (
                                                <span className="text-yellow-600">
                                                    {" "}
                                                    (in {daysDifference}{" "}
                                                    {daysDifference === 1
                                                        ? "day"
                                                        : "days"}
                                                    )
                                                </span>
                                            )}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(index)}
                                    className="p-2"
                                    aria-label="Delete item"
                                >
                                                                        <svg
                                        fill="#000000"
                                        version="1.1"
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlnsXlink="http://www.w3.org/1999/xlink"
                                        width="20px"
                                        height="20px"
                                        viewBox="0 0 41.336 41.336"
                                        xmlSpace="preserve"
                                    >
                                        <g>
                                            <path
                                                d="M36.335,5.668h-8.167V1.5c0-0.828-0.672-1.5-1.5-1.5h-12c-0.828,0-1.5,0.672-1.5,1.5v4.168H5.001c-1.104,0-2,0.896-2,2
                    s0.896,2,2,2h2.001v29.168c0,1.381,1.119,2.5,2.5,2.5h22.332c1.381,0,2.5-1.119,2.5-2.5V9.668h2.001c1.104,0,2-0.896,2-2
                    S37.438,5.668,36.335,5.668z M14.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21c0-0.828,0.672-1.5,1.5-1.5
                    s1.5,0.672,1.5,1.5V35.67z M22.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21c0-0.828,0.672-1.5,1.5-1.5
                    s1.5,0.672,1.5,1.5V35.67z M25.168,5.668h-9V3h9V5.668z M30.168,35.67c0,0.828-0.672,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-21
                    c0-0.828,0.672-1.5,1.5-1.5s1.5,0.672,1.5,1.5V35.67z"
                                            />
                                        </g>
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default ShelfSense;
