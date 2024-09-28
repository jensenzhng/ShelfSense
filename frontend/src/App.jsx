import { useState } from "react";
import { useVoiceToText } from "react-speakup";

function ShelfSense() {
    const [inputValue, setInputValue] = useState("");
    const [quantity, setQuantity] = useState("");
    const [expirationDate, setExpirationDate] = useState("");
    const [ingredients, setIngredients] = useState([]);

    const { startListening, stopListening, transcript, reset } =
        useVoiceToText();

    const [isListening, setIsListening] = useState(false);

    const handleAdd = () => {
        if (
            inputValue.trim() !== "" &&
            quantity.trim() !== "" &&
            expirationDate.trim() !== ""
        ) {
            const newIngredient = {
                name: inputValue,
                quantity,
                expiration: expirationDate,
            };
            setIngredients([...ingredients, newIngredient]);
            setInputValue(""); // clear input field after adding
            setQuantity(""); // clear quantity field
            setExpirationDate(""); // clear expiration date field
        }
    };

    const handleDelete = (index) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(newIngredients);
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
        <div className="flex flex-col items-center mt-10 px-8">
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

                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                    Add
                </button>
            </div>

            {transcript && (
                <p className="mt-4 text-gray-700">You said: {transcript}</p>
            )}

            <div className="space-y-3 w-full max-w-2xl mt-4">
                {ingredients.map((ingredient, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center border border-gray-300 rounded-lg p-3"
                    >
                        <span className="text-gray-700">
                            {ingredient.quantity} {ingredient.name} - expires on{" "}
                            {ingredient.expiration}
                        </span>
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
                                width="24px"
                                height="24px"
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
                ))}
            </div>
        </div>
    );
}

export default ShelfSense;
