import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleGenAI, Type, Schema } from "@google/genai";

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

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your .env.local file." }, { status: 500 });
    }

    const formData = await req.formData();
    const count = parseInt(formData.get("count") as string) || 5;
    const topic = formData.get("topic") as string;
    const file = formData.get("file") as File | null;

    if (!topic && !file) {
      return NextResponse.json({ error: "Either a topic or a file is required" }, { status: 400 });
    }

    const contents: any[] = [];
    let prompt = `Generate exactly ${count} multiple choice questions. `;

    if (file) {
      const bytes = await file.arrayBuffer();
      const base64Data = Buffer.from(bytes).toString("base64");
      
      contents.push({
        inlineData: {
          data: base64Data,
          mimeType: file.type || "application/pdf",
        }
      });
      prompt += "Base these questions strictly on the content of the provided document. ";
      if (topic) {
        prompt += `Focus specifically on the topic: "${topic}". `;
      }
    } else if (topic) {
      prompt += `The topic is: "${topic}". `;
    }

    prompt += `
For each question, provide exactly 4 options.
'correctIndex' must be an integer between 0 and 3, corresponding to the correct option in the options array.
Return the output as a JSON array matching the required schema.
`;

    // The SDK expects contents as a string, or an object with `role` and `parts`.
    // Wait, let's use the simplest format if we are passing mixed inlineData and text parts.
    // The structure is `[{text: prompt}, {inlineData: ...}]` within `parts` or just an array of parts.
    
    // We should pass a structured Request to the SDK
    const parts = [...contents, { text: prompt }];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using 2.5-flash for speed and multi-modal support
      contents: parts,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI");
    }

    const questions = JSON.parse(resultText);

    return NextResponse.json({ questions });

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate questions" },
      { status: 500 }
    );
  }
}
