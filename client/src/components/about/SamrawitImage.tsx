import React from 'react';

const SamrawitImage = () => {
  return (
    <img 
      src="/images/team/samrawit-kassa.jpg" 
      alt="Samrawit Kassa" 
      className="w-full h-64 object-cover"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        console.error('Error loading CEO image');
        // Fallback to a placeholder image if loading fails
        target.onerror = null;
        target.src = "https://randomuser.me/api/portraits/women/22.jpg";
      }}
    />
  );
};

export default SamrawitImage;