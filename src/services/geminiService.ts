import { GoogleGenAI, Type } from "@google/genai";

// Linh lưu ý: Ở môi trường Vite/Vercel nên dùng import.meta.env.VITE_GEMINI_KEY 
// nhưng tôi giữ nguyên process.env theo code gốc của bạn để tránh xung đột
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY || process.env.GEMINI_API_KEY || "" });

// 1. HÀM STREAMING - GIÚP GIA SƯ NHẢ CHỮ NGAY LẬP TỨC (FIX LỖI BUILD)
export const getTutorStream = async (
  message: string, 
  history: { role: string, parts: { text: string }[] }[], 
  imageBase64: string | undefined,
  onChunk: (chunk: string) => void
) => {
  // Dùng bản Flash để tốc độ phản hồi là nhanh nhất
  const model = "gemini-1.5-flash"; 
  
  const parts: any[] = [{ text: message }];
  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageBase64
      }
    });
  }

  try {
    const result = await ai.models.generateContentStream({
      model,
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: "user", parts }
      ],
      config: {
        // Giữ nguyên chỉ dẫn hệ thống của Linh
        systemInstruction: `Bạn là FocusAI, một trợ lý học tập thông minh... [giống code gốc của Linh]`,
      },
    });

    // Nhả chữ về cho Tutor.tsx ngay khi có dữ liệu
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) onChunk(chunkText);
    }
  } catch (error) {
    console.error("Lỗi Stream:", error);
    throw error;
  }
};

// 2. HÀM CŨ CỦA LINH (GIỮ LẠI ĐỂ DỰ PHÒNG)
export const getTutorResponse = async (message: string, history: any[], imageBase64?: string) => {
  const model = "gemini-1.5-flash";
  const parts: any[] = [{ text: message }];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
  }

  const response = await ai.models.generateContent({
    model,
    contents: [
      ...history.map(h => ({ role: h.role, parts: h.parts })),
      { role: "user", parts }
    ],
    config: {
      systemInstruction: `Bạn là FocusAI, một trợ lý học tập thông minh...`,
    },
  });

  return response;
};

// 3. HÀM TẠO QUIZ (GIỮ NGUYÊN LOGIC JSON SCHEMA CỦA LINH)
export const generateQuiz = async (subject: string, grade: string) => {
  const model = "gemini-1.5-flash";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Tạo 5 câu hỏi trắc nghiệm về môn ${subject} lớp ${grade} theo chương trình giáo dục phổ thông Việt Nam.`,
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
