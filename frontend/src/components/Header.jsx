import { Link } from "react-router-dom";
import ShelfSenseLogo from '../assets/ShelfSense1.png'

function Header() {
    return (
        <header className="flex justify-between items-center py-4 px-16 bg-[#f5f8ff] shadow-md">
            {/* Left: ShelfSense logo or name */}
            <div className="text-2xl font-bold text-green-600">
                <Link to="/">
                    <img src={ShelfSenseLogo} width={80} alt="" />
                </Link>
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
