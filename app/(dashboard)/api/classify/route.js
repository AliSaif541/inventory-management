import OpenAI from "openai";
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req, res) {
  console.log('Request received');
  const { image } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct:free",
      messages: [
        { role: "system", content: "You are a helpful assistant that classifies item images for an inventory management system and provides an item name, a category, and a short (1-2 line) description of item. Provide only this data in json form without the '''json tag and nothing else. If for some reason you are not able to detect any object, say 'no object detected' in item name, say 'no category' in category and say 'no description' in the description." },
        { role: "user", content: "Classify the following image and provide an item name, category, and description: " },
        { role: "user", content: image }
      ],
    });

    const { content } = completion.choices[0].message;
    
    const result = JSON.parse(content); 
    //console.log('going result',result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error classifying image:', error);
    return NextResponse.json({ error: 'Error classifying image' }, { status: 500 });
  }
}
