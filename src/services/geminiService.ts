import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getTutorResponse = async (message: string, history: { role: string, parts: { text: string }[] }[], imageBase64?: string) => {
  const model = "gemini-3-flash-preview";
  
  const parts: any[] = [{ text: message }];
  if (imageBase64) {
    parts.push({
      inlineData: { mimeType: "image/jpeg", data: imageBase64 }
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: [
      ...history.map(h => ({ role: h.role, parts: h.parts })),
      { role: "user", parts }
    ],
    config: {
      systemInstruction: `Bạn là FocusAI, một trợ lý học tập thông minh... [giữ nguyên nội dung gốc của bạn]`,
    },
  });

  return response;
};

export const generateQuiz = async (subject: string, grade: string) => {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: `Tạo 5 câu hỏi trắc nghiệm môn ${subject} lớp ${grade}... [giữ nguyên nội dung gốc của bạn]`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          quizzes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctIndex", "explanation"]
            }
          }
        },
        required: ["quizzes"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};
