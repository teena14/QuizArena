import { GoogleGenAI, Type, Schema } from "@google/genai";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const responseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      text: { type: Type.STRING },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      correctIndex: { type: Type.INTEGER },
    },
    required: ["text", "options", "correctIndex"],
  },
};

async function main() {
  try {
    const prompt = "Generate exactly 2 multiple choice questions. The topic is: \"History\". For each question, provide exactly 4 options. 'correctIndex' must be an integer between 0 and 3, corresponding to the correct option in the options array. Return the output as a JSON array matching the required schema.";
    const parts = [{ text: prompt }];

    console.log("Calling model...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: parts,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    
    console.log("Response text:", response.text);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
