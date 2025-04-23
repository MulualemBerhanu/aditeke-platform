import { storage } from '../server/storage';

async function updateGenesisProjectImage() {
  try {
    console.log('Updating Genesis Group Home project image...');
    
    const updatedProject = await storage.updateProject(500, {
      thumbnail: '/images/projects/genesis-group-home.png'
    });
    
    console.log('Successfully updated project image:', updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
  }
}

updateGenesisProjectImage();