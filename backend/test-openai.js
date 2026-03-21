// Test script to verify OpenAI API key is working
require('dotenv').config();
const OpenAI = require('openai');

console.log('Testing OpenAI API Key...\n');

// Check if API key exists
if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set in .env file');
    process.exit(1);
}

console.log('✅ API Key found in environment');
console.log(`   Key starts with: ${process.env.OPENAI_API_KEY.substring(0, 10)}...`);

// Initialize OpenAI client
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Test API call
async function testOpenAI() {
    try {
        console.log('\n🤖 Testing OpenAI API call...');

        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant.'
                },
                {
                    role: 'user',
                    content: 'Say "Hello, I am working!" in one sentence.'
                }
            ],
            max_tokens: 50
        });

        console.log('\n✅ OpenAI API is working!');
        console.log('\nResponse:', response.choices[0].message.content);
        console.log('\nTokens used:', response.usage.total_tokens);

    } catch (error) {
        console.error('\n❌ OpenAI API Error:');
        console.error('Message:', error.message);

        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }

        if (error.code) {
            console.error('Error code:', error.code);
        }

        process.exit(1);
    }
}

testOpenAI();
