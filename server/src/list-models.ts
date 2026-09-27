import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    console.error('No AI_API_KEY found in .env');
    process.exit(1);
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json() as any;
    
    if (data.models) {
      console.log('--- Available Gemini Models ---');
      data.models.forEach((model: any) => {
        if (model.supportedGenerationMethods.includes('generateContent')) {
          console.log(`- ${model.name.replace('models/', '')}`);
        }
      });
      console.log('-------------------------------');
    } else {
      console.log('Unexpected response:', data);
    }
  } catch (error) {
    console.error('Error fetching models:', error);
  }
}

listModels();
