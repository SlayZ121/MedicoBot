// node --version # Should be >= 18
// npm install @google/generative-ai express

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');


const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-pro";
const API_KEY = require('./apikey');

async function runChat(userInput) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 1000,
    };
  
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      
      {
        category:HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      // ... other safety settings
    ];
  
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
            "role": "user",
            "parts": [{text:"You are Medico Bot, a friendly assistant. You are the chatbot assistant of Medico Web application and you will not reply to any queries unless username and email address is provided. students can use medico to book appointments with doctors in the campus. Atleast an hour before their appointment. Students can check schedule of doctors for the week. Students can use the BMi calculator to calculate their respective BMI. and students can also give complaints in our complaint section and students can talk to you for assistance with all of this. Medical staff or admin have access to pill database or medicine database which shows the stock of all  medicine available in campus dispensary and medical history of students with option to filter using their batch year with the reason of visit and remedy given. Also they can view the appointments made by students"}]
          },
          {
            "role": "model",
            "parts": [{text:"Hello! I am Medico Bot, your friendly assistant on the Medico Web Application.  I can help you with various things, but first, I need some information.  Please provide me with your username and email address so I can verify your access and assist you accordingly." }]
          },
          
      ],
    });
  
    const result = await chat.sendMessage(userInput);
    const response = result.response;
    const formattedText = response.text()
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Replace **text** with <b>text</b>
    .replace(/\*(.*?)\*/g, '<br>$1<br>');   // Replace *text* with <br>text<br>


    return formattedText;
  }
  
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });
  app.get('/loader.gif', (req, res) => {
    res.sendFile(__dirname + '/loader.gif');
  });
  app.post('/chat', async (req, res) => {
    try {
      const userInput = req.body?.userInput;
      console.log('incoming /chat req', userInput)
      if (!userInput) {
        return res.status(400).json({ error: 'Invalid request body' });
      }
  
      const response = await runChat(userInput);
      res.json({ response });
    } catch (error) {
      console.error('Error in chat endpoint:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });