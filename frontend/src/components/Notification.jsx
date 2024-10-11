import React, { useEffect, useState } from 'react';
import { CircleCheck, X } from 'lucide-react';

function Notification({ message, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true); // Show notification
      const timer = setTimeout(() => {
        setIsVisible(false); // Hide after 5 seconds
        onClose(); // Call onClose to reset message in parent
      }, 3000);

      return () => {
        clearTimeout(timer); // Cleanup timer on unmount or message change
      };
    }
  }, [message, onClose]); // Effect runs whenever the message changes

  const handleClose = () => {
    setIsVisible(false); // Close manually when button clicked
    onClose(); // Call onClose to reset message in parent
  };

  return (
    <div
      className={`transition-transform fixed left-1/2 bottom-32 -translate-x-1/2  duration-500 transform ${
        isVisible ? 'translate-y-0' : 'translate-y-20'
      }`}
      style={{ zIndex: 9999 }}
    >
      {isVisible && (
        <div className="bg-[#141617] text-white bott p-4 h-20 rounded-2xl shadow-md flex items-center justify-center space-x-4 mb-2">
          <span className="text-2xl">
            <CircleCheck className="bg-green-500 rounded-full text-black" size={48} />
          </span>
          <span>{message}</span>
          <button
            onClick={handleClose}
            className="ml-4 text-white hover:text-gray-300 focus:outline-none"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Notification;