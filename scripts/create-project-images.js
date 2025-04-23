import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create project images directory if it doesn't exist
const projectImagesDir = path.join('public', 'images', 'projects');
if (!fs.existsSync(projectImagesDir)) {
  fs.mkdirSync(projectImagesDir, { recursive: true });
  console.log(`Created directory: ${projectImagesDir}`);
}

// Function to create a visually appealing thumbnail for a project
function createProjectThumbnail(name, outputPath, color = '#6366F1') {
  // Create a visually rich SVG with project title, logo, and design elements
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('');
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <!-- Background with gradient -->
    <defs>
      <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" />
        <stop offset="100%" stop-color="${darkenColor(color, 30)}" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="1" opacity="0.15" />
      </pattern>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000000" flood-opacity="0.3"/>
      </filter>
    </defs>
    
    <!-- Main background -->
    <rect width="800" height="600" fill="url(#bg-gradient)" />
    <rect x="0" y="0" width="800" height="600" fill="url(#grid)" />
    
    <!-- Decorative elements -->
    <circle cx="650" cy="150" r="100" fill="white" opacity="0.1" />
    <circle cx="200" cy="500" r="150" fill="white" opacity="0.05" />
    
    <!-- Project initials -->
    <text x="400" y="320" font-family="Arial, sans-serif" font-size="180" font-weight="bold" text-anchor="middle" fill="white" filter="url(#shadow)">${initials}</text>
    
    <!-- Project name -->
    <text x="400" y="500" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle" fill="white">
      ${name}
    </text>
  </svg>`;

  fs.writeFileSync(outputPath, svg);
  console.log(`Created enhanced thumbnail: ${outputPath}`);
  return outputPath;
}

// Function to darken a hex color
function darkenColor(hex, percent) {
  // Remove the # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Darken
  r = Math.floor(r * (100 - percent) / 100);
  g = Math.floor(g * (100 - percent) / 100);
  b = Math.floor(b * (100 - percent) / 100);
  
  // Convert back to hex
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Create map of project names to their original image paths/filenames
const projectImageMap = {
  'Genesis Group Home Website': 'genesis-thumb.jpg',
  'Personal Portfolio Website': 'portfolio-thumb.jpg',
  'Mobile Banking Application': 'banking-thumb.jpg',
  'E-commerce Platform Redesign': 'ecommerce-thumb.jpg',
  'Healthcare Management System': 'healthcare-thumb.jpg'
};

// Create vibrant colors for each project
const projectColors = {
  'genesis-thumb.jpg': '#4F46E5', // Indigo
  'portfolio-thumb.jpg': '#0EA5E9', // Sky Blue
  'banking-thumb.jpg': '#F59E0B', // Amber
  'ecommerce-thumb.jpg': '#10B981', // Emerald
  'healthcare-thumb.jpg': '#8B5CF6', // Violet
};

console.log('Creating enhanced project thumbnails...');

// Create each thumbnail
Object.entries(projectImageMap).forEach(([projectName, imageName]) => {
  const outputPath = path.join(projectImagesDir, imageName);
  createProjectThumbnail(projectName, outputPath, projectColors[imageName]);
});

// Create project-specific screenshots
function createRealProjectThumbnail() {
  // Create real-looking thumbnails for the actual projects
  
  // Genesis Group Home thumbnail
  const genesisThumb = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="header-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#2563EB" />
        <stop offset="100%" stop-color="#1E40AF" />
      </linearGradient>
    </defs>
    <!-- Website background -->
    <rect width="800" height="600" fill="#f8fafc" />
    
    <!-- Header -->
    <rect x="0" y="0" width="800" height="80" fill="url(#header-gradient)" />
    
    <!-- Logo -->
    <text x="50" y="50" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white">Genesis Home</text>
    
    <!-- Navigation -->
    <text x="650" y="50" font-family="Arial, sans-serif" font-size="16" fill="white">Services</text>
    <text x="730" y="50" font-family="Arial, sans-serif" font-size="16" fill="white">Contact</text>
    
    <!-- Hero Section -->
    <rect x="50" y="120" width="700" height="250" rx="8" fill="#e2e8f0" />
    <text x="100" y="200" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#1e293b">Genesis Group Home</text>
    <text x="100" y="250" font-family="Arial, sans-serif" font-size="18" fill="#334155" width="500">Professional care services for adults with disabilities</text>
    <rect x="100" y="280" width="180" height="45" rx="6" fill="#2563EB" />
    <text x="140" y="310" font-family="Arial, sans-serif" font-size="16" fill="white">Our Services</text>
    
    <!-- Content Blocks -->
    <rect x="50" y="400" width="220" height="150" rx="8" fill="#f1f5f9" />
    <rect x="290" y="400" width="220" height="150" rx="8" fill="#f1f5f9" />
    <rect x="530" y="400" width="220" height="150" rx="8" fill="#f1f5f9" />
    
    <!-- Icons -->
    <circle cx="160" cy="450" r="30" fill="#bfdbfe" />
    <circle cx="400" cy="450" r="30" fill="#bfdbfe" />
    <circle cx="640" cy="450" r="30" fill="#bfdbfe" />
    
    <!-- Text under blocks -->
    <text x="110" y="510" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#334155" text-anchor="middle">24/7 Care</text>
    <text x="400" y="510" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#334155" text-anchor="middle">Professional Staff</text>
    <text x="640" y="510" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#334155" text-anchor="middle">Quality of Life</text>
  </svg>`;
  
  fs.writeFileSync(path.join(projectImagesDir, 'genesis-thumb.jpg'), genesisThumb);
  console.log('Created realistic Genesis Group Home thumbnail');
  
  // Portfolio thumbnail
  const portfolioThumb = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <!-- Dark theme portfolio -->
    <rect width="800" height="600" fill="#111827" />
    
    <!-- Header -->
    <rect x="0" y="0" width="800" height="70" fill="#1f2937" />
    <text x="50" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#f9fafb">Mulualem.dev</text>
    
    <!-- Navigation -->
    <text x="550" y="45" font-family="Arial, sans-serif" font-size="16" fill="#d1d5db">Home</text>
    <text x="620" y="45" font-family="Arial, sans-serif" font-size="16" fill="#d1d5db">Projects</text>
    <text x="700" y="45" font-family="Arial, sans-serif" font-size="16" fill="#d1d5db">Contact</text>
    
    <!-- Hero Section -->
    <text x="100" y="170" font-family="Arial, sans-serif" font-size="44" font-weight="bold" fill="#f9fafb">Mulualem Berhanu</text>
    <text x="100" y="220" font-family="Arial, sans-serif" font-size="24" fill="#9ca3af">Full Stack Developer</text>
    <text x="100" y="260" font-family="Arial, sans-serif" font-size="16" fill="#d1d5db" width="450">Creating elegant solutions to complex problems with modern technologies</text>
    
    <!-- Tech stack -->
    <rect x="100" y="290" width="100" height="30" rx="15" fill="#3b82f6" opacity="0.6" />
    <text x="150" y="310" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">React</text>
    
    <rect x="210" y="290" width="100" height="30" rx="15" fill="#10b981" opacity="0.6" />
    <text x="260" y="310" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">Node.js</text>
    
    <rect x="320" y="290" width="100" height="30" rx="15" fill="#f59e0b" opacity="0.6" />
    <text x="370" y="310" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle">TypeScript</text>
    
    <!-- Projects Grid -->
    <rect x="100" y="370" width="180" height="150" rx="8" fill="#1f2937" />
    <rect x="310" y="370" width="180" height="150" rx="8" fill="#1f2937" />
    <rect x="520" y="370" width="180" height="150" rx="8" fill="#1f2937" />
    
    <!-- Project titles -->
    <text x="140" y="450" font-family="Arial, sans-serif" font-size="16" fill="#f9fafb" text-anchor="start">E-commerce</text>
    <text x="350" y="450" font-family="Arial, sans-serif" font-size="16" fill="#f9fafb" text-anchor="start">Dashboard</text>
    <text x="560" y="450" font-family="Arial, sans-serif" font-size="16" fill="#f9fafb" text-anchor="start">Mobile App</text>
    
    <!-- Decorative elements -->
    <circle cx="650" cy="180" r="70" fill="#3b82f6" opacity="0.1" />
    <circle cx="700" cy="150" r="40" fill="#10b981" opacity="0.1" />
  </svg>`;
  
  fs.writeFileSync(path.join(projectImagesDir, 'portfolio-thumb.jpg'), portfolioThumb);
  console.log('Created realistic Portfolio thumbnail');
}

// Create the realistic thumbnails
createRealProjectThumbnail();

console.log('Project thumbnails created successfully!');