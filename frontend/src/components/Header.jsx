import { Link } from "react-router-dom";

function Header() {
    return (
        <header className="flex justify-between items-center py-4 px-8 bg-gray-100 shadow-md">
            {/* Left: ShelfSense logo or name */}
            <div className="text-2xl font-bold text-green-600">
                <Link to="/">ShelfSense</Link>
            </div>

            {/* Right: Links */}
            <nav className="space-x-4">
                <Link
                    to="/"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                    Home
                </Link>
                <Link
                    to="/recipes"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                    Recipes
                </Link>
            </nav>
        </header>
    );
}

export default Header;
