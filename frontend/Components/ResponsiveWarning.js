import { useEffect, useState } from "react";

const ResponsiveWarning = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if screen width is less than 768px (Mobile devices)
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);

  return (
    <div>
      {isMobile && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
            <h2 className="text-lg font-semibold text-red-500">
              🚀 For a better experience, please use a desktop!
            </h2>
            <button 
              className="mt-4 bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600"
              onClick={() => setIsMobile(false)}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveWarning;
