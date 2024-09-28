import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home'; // Make sure you have a Home page
import Recipes from './components/Recipes'; // Import the new Recipes page
import Header from './components/Header'; // Import your Header component if you have one

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recipes" element={<Recipes />} /> {/* New route for /recipes */}
      </Routes>
    </div>
  );
}

export default App;
