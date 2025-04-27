import React from 'react';

interface TeamImageProps {
  name: string;
  style?: React.CSSProperties;
}

const TeamImage: React.FC<TeamImageProps> = ({ name, style = {} }) => {
  // Create clean initials for the SVG
  const initials = name.split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
  
  // Set colors based on the person's name for visual distinction
  const bgColor = name === "Mulualem Berhanu" 
    ? "#4F46E5" // Indigo for Mulualem
    : "#3B82F6"; // Blue for Samrawit
  
  // Create SVG avatar with initials
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="${bgColor}" />
      <text x="50%" y="50%" font-family="Arial" font-size="70" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text>
    </svg>
  `;
  
  // Convert SVG to a data URL
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
  
  return (
    <div className="w-full h-64 bg-gray-100 flex items-center justify-center relative">
      <img 
        src={dataUrl}
        alt={name}
        className="w-full h-full object-cover"
        style={style}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2">
        {name}
      </div>
    </div>
  );
};

export default TeamImage;