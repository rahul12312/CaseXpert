const https = require('https');
const fs = require('fs');
const path = require('path');

const profilesDir = path.join(__dirname, '../frontend/public/uploads/profiles');

// Ensure directory exists
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      } else {
        reject(new Error(`Failed to download, status code: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

const chunkArray = (array, size) => {
  const chunked_arr = [];
  let index = 0;
  while (index < array.length) {
    chunked_arr.push(array.slice(index, size + index));
    index += size;
  }
  return chunked_arr;
};

const generateImages = async () => {
  let tasks = [];
  
  for (let i = 18; i <= 53; i++) {
    tasks.push({ type: 'm', index: i });
  }
  for (let i = 5; i <= 14; i++) {
    tasks.push({ type: 'f', index: i });
  }

  const batches = chunkArray(tasks, 5); // 5 at a time
  
  console.log(`Starting generation in ${batches.length} batches of 5...`);

  for (let b = 0; b < batches.length; b++) {
    console.log(`Processing batch ${b + 1} of ${batches.length}...`);
    const batchPromises = batches[b].map(task => {
      const seed = Math.floor(Math.random() * 1000000);
      const genderStr = task.type === 'm' ? 'male' : 'female';
      const clothingStr = task.type === 'm' ? 'full formal suit and tie' : 'formal suit blazer';
      const prompt = encodeURIComponent(`Professional realistic portrait of an Indian ${genderStr} lawyer wearing a ${clothingStr}, smiling, plain studio background, high quality photography, seed ${seed}`);
      const url = `https://image.pollinations.ai/prompt/${prompt}?width=512&height=512&nologo=true&seed=${seed}`;
      const filepath = path.join(profilesDir, `${task.type}${task.index}.png`);
      
      return downloadImage(url, filepath)
        .then(() => console.log(`Downloaded ${task.type}${task.index}.png`))
        .catch(err => console.log(`Error ${task.type}${task.index}.png:`, err.message));
    });

    await Promise.all(batchPromises);
    await delay(1000); // 1 sec delay between batches
  }

  console.log("Finished generating all images!");
};

generateImages();
