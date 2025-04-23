const https = require('https');
const fs = require('fs');
const path = require('path');

// Function to download an image from a URL and save it to a file
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    // Create directory if it doesn't exist
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create write stream
    const file = fs.createWriteStream(filepath);
    
    // Use https to download the image
    https.get(url, (response) => {
      // Check if response is successful
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image, status code: ${response.statusCode}`));
        return;
      }
      
      // Pipe the image data to the file
      response.pipe(file);
      
      // Handle events
      file.on('finish', () => {
        file.close();
        console.log(`Image downloaded successfully to ${filepath}`);
        resolve(filepath);
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete the file if there's an error
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file if there's an error
      reject(err);
    });
  });
}

// Get the URL from command line arguments
const imageUrl = process.argv[2];
const outputPath = process.argv[3];

if (!imageUrl || !outputPath) {
  console.error('Usage: node download-image.js <image-url> <output-path>');
  process.exit(1);
}

// Download the image
downloadImage(imageUrl, outputPath)
  .then(filepath => {
    console.log(`Image saved to ${filepath}`);
  })
  .catch(error => {
    console.error('Error downloading image:', error);
    process.exit(1);
  });