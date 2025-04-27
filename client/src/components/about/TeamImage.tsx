import React from 'react';

interface TeamImageProps {
  name: string;
  style?: React.CSSProperties;
}

const TeamImage: React.FC<TeamImageProps> = ({ name, style = {} }) => {
  // Use a static placeholder image from a reliable CDN service
  // This will ensure the image loads consistently in all environments
  if (name === "Mulualem Berhanu") {
    return (
      <img 
        src="https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg"
        alt={name}
        className="w-full h-64 object-cover"
        style={{
          objectPosition: "center top",
          ...style
        }}
      />
    );
  } else if (name === "Samrawit Kassa") {
    return (
      <img 
        src="https://res.cloudinary.com/demo/image/upload/c_fill,g_north,h_400,w_400/v1573574749/lhtny0ix70ifluczlrq5.jpg"
        alt={name}
        className="w-full h-64 object-cover"
        style={{
          objectPosition: "center top",
          ...style
        }}
      />
    );
  }
  
  // Default fallback to a simple SVG placeholder with the name
  return (
    <div 
      className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500"
      style={style}
    >
      {name}
    </div>
  );
};

export default TeamImage;