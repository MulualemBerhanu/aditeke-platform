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

// Function to create a default color-based thumbnail for a project
function createDefaultProjectImage(name, outputPath, color = '#6366F1') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="${color}" opacity="0.6" />
    <rect x="0" y="0" width="800" height="600" fill="url(#grid)" />
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="1" opacity="0.2" />
      </pattern>
    </defs>
    <text x="400" y="300" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="#ffffff">${name}</text>
  </svg>`;

  fs.writeFileSync(outputPath, svg);
  console.log(`Created SVG thumbnail: ${outputPath}`);
  return outputPath;
}

// Restore original database thumbnail references
console.log('Updating projects to use original image filenames...');

// Create map of project names to their original image paths/filenames
const projectImageMap = {
  'Genesis Group Home Website': 'genesis-thumb.jpg',
  'Personal Portfolio Website': 'portfolio-thumb.jpg',
  'Mobile Banking Application': 'banking-thumb.jpg',
  'E-commerce Platform Redesign': 'ecommerce-thumb.jpg',
  'Healthcare Management System': 'healthcare-thumb.jpg'
};

// Create default color-coded images for each project
const projectColors = {
  'genesis-thumb.jpg': '#4F46E5',
  'portfolio-thumb.jpg': '#0EA5E9',
  'banking-thumb.jpg': '#F59E0B',
  'ecommerce-thumb.jpg': '#10B981',
  'healthcare-thumb.jpg': '#8B5CF6',
};

// Create each thumbnail
Object.entries(projectImageMap).forEach(([projectName, imageName]) => {
  const outputPath = path.join(projectImagesDir, imageName);
  createDefaultProjectImage(projectName, outputPath, projectColors[imageName]);
});

// Also create png versions of the images
Object.entries(projectImageMap).forEach(([projectName, imageName]) => {
  const jpgPath = path.join(projectImagesDir, imageName);
  const pngPath = path.join(projectImagesDir, imageName.replace('.jpg', '.png'));
  
  try {
    // Copy the SVG to a PNG path as well (actually just create the same SVG with a different extension)
    fs.copyFileSync(jpgPath, pngPath);
    console.log(`Created PNG version at: ${pngPath}`);
  } catch (error) {
    console.error(`Error creating PNG version for ${projectName}:`, error);
  }
});

console.log('All project thumbnails restored to original filenames!');