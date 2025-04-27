import React from 'react';

interface TeamImageProps {
  name: string;
  style?: React.CSSProperties;
}

const TeamImage: React.FC<TeamImageProps> = ({ name, style = {} }) => {
  // Use static public paths that will be available in both development and production
  const imagePath = name === "Mulualem Berhanu" 
    ? "/cto-mulualem.jpeg" 
    : "/ceo-samrawit.jpg";
  
  return (
    <div className="w-full h-64 relative overflow-hidden">
      <img 
        src={imagePath}
        alt={name}
        className="w-full h-full object-cover"
        style={{
          objectPosition: "center top",
          ...style
        }}
      />
      {/* Fallback for images that might not load */}
      <noscript>
        <div className="absolute inset-0 bg-primary flex items-center justify-center text-white text-2xl">
          {name}
        </div>
      </noscript>
    </div>
  );
};

export default TeamImage;