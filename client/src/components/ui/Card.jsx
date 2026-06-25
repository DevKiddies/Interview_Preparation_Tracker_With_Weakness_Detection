import React from 'react';

function Card({ children, width = '480px', height = 'auto' }) {
  return (
    <div
      className="mx-auto border border-gray-300 dark:border-slate-700 rounded-xl shadow-lg mt-10 mb-10 p-6 sm:p-8 w-full text-2xl text-center bg-white dark:bg-slate-800 transition-colors duration-200"
      style={{ 
        maxWidth: width, 
        height: height,
        boxSizing: 'border-box' // Ensures padding doesn't break layout
      }}
    >
      {children}
    </div>
  );
}

export default Card;