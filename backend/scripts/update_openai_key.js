const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const apiKey = 'YOUR_API_KEY_HERE';

try {
    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Check if OPENAI_API_KEY exists
    if (envContent.includes('OPENAI_API_KEY=')) {
        // Replace it
        envContent = envContent.replace(/OPENAI_API_KEY=.*/g, `OPENAI_API_KEY="${apiKey}"`);
        console.log('Updated existing OPENAI_API_KEY.');
    } else {
        // Append it
        envContent += `\nOPENAI_API_KEY="${apiKey}"\n`;
        console.log('Appended new OPENAI_API_KEY.');
    }

    fs.writeFileSync(envPath, envContent);
    console.log('Successfully updated .env file.');

} catch (error) {
    console.error('Error updating .env file:', error);
    process.exit(1);
}
