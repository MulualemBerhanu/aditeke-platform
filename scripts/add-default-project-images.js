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

// Function to create an SVG thumbnail for a project
function createProjectThumbnail(name, outputPath, color = '#6366F1') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="${color}" opacity="0.3" />
    <rect x="0" y="0" width="800" height="600" fill="url(#grid)" />
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="1" opacity="0.2" />
      </pattern>
    </defs>
    <text x="400" y="300" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="#000000">${name}</text>
  </svg>`;

  fs.writeFileSync(outputPath, svg);
  console.log(`Created SVG thumbnail: ${outputPath}`);
}

// Generate default thumbnails for our projects
const projects = [
  { id: 500, name: 'Genesis Group Home', filename: 'genesis-group-home.svg', color: '#4F46E5' },
  { id: 501, name: 'Portfolio Website', filename: 'portfolio-thumb.svg', color: '#0EA5E9' },
  { id: 502, name: 'E-Commerce Platform', filename: 'ecommerce-platform.svg', color: '#10B981' },
  { id: 503, name: 'Social Media App', filename: 'social-media-app.svg', color: '#F59E0B' },
  { id: 504, name: 'AI Chat Interface', filename: 'ai-chat-interface.svg', color: '#8B5CF6' },
  { id: 505, name: 'Hotel Booking System', filename: 'hotel-booking.svg', color: '#EC4899' }
];

// Create each project thumbnail
projects.forEach(project => {
  const outputPath = path.join(projectImagesDir, project.filename);
  createProjectThumbnail(project.name, outputPath, project.color);
});

console.log('All project thumbnails generated successfully!');