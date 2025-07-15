import React from 'react';
import rawrImage from '../assets/rawr.png'; // Import the image from its relative path

// Home component now accepts currentUser and isLoggedIn props
const Home = ({ currentUser, isLoggedIn }) => {
  const userName = currentUser ? currentUser.username : 'Anonymous';

  return (
    <div className="container mx-auto p-4 text-center min-h-[calc(100vh-64px)] flex flex-col justify-center items-center">
      {/* <img
        src={rawrImage} // Use the imported image variable here
        alt="A rawr-ing image" // Always provide a meaningful alt text for accessibility
        // Adjusted Tailwind classes for smaller size:
        className="w-40 md:w-48 lg:w-56 h-auto rounded-lg shadow-lg mb-8 max-w-full"
      /> */}
      <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to THE Blog!</h1>
      <p className="text-xl text-gray-600 mb-8">
        Hello, <span className="font-semibold text-blue-600">{userName}</span>!
      </p>
      <p className="text-lg text-gray-700 max-w-2xl">
        Feel free to share your thoughts
      </p>
    </div>
  );
};

export default Home;
