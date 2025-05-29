'use client'
import React from 'react';
import Link from 'next/link';

const NotFoundPage = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center bg-gray-100 text-gray-800 px-4">
      <h1 className="text-6xl font-bold mb-4 text-amber-600">404</h1>
      <h2 className="text-2xl font-semibold mb-2 text-amber-800">Page Not Found</h2>
      <p className="text-center max-w-md mb-6 text-amber-800 font-medium">
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition">
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFoundPage;