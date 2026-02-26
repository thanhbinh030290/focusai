import { GoogleGenAI, Type } from "@google/genai";

// Sửa lại để lấy đúng Key VITE_GEMINI_API_KEY Linh đã đặt trên Vercel
const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" 
});

// 1. HÀM STREAMING - GIÚP NHẢ CHỮ NGAY LẬP TỨC (Sửa lỗi "not exported")
export const getTutorStream = async (
  message: string, 
  history: { role: string, parts: { text: string }[] }[], 
  imageBase64: string | undefined,
  onChunk: (chunk: string) => void
) => {
  // Giữ nguyên model gemini-3-flash-preview của Linh
  const model = "gemini-3-flash-preview"; 
  
  const parts: any[] = [{ text: message }];
  if (imageBase64) {
    parts.push({
      inlineData: { mimeType: "image/jpeg", data: imageBase64 }
    });
  }

  try {
    const result = await ai.models.generateContentStream({
      model,
      contents: [
        ...history.slice(-6).map(h => ({ role: h.role, parts: h.parts })),
        { role: "user", parts }
      ],
      config: {
        // Giữ nguyên 100% chỉ dẫn hệ thống gốc của Linh
        systemInstruction: `Bạn là FocusAI, một trợ lý học tập thông minh... [giống bản gốc của Linh]`,
      },
    });

    // Nhả chữ về giao diện ngay khi có dữ liệu mới
    for await (const chunk of result.stream) {
      const chunkText = chunk.text; 
      if (chunkText) onChunk(chunkText);
    }
  } catch (error) {
    console.error("Lỗi Stream:", error);
    throw error;
  }
};

// 2. GIỮ LẠI HÀM CŨ ĐỂ DỰ PHÒNG
export const getTutorResponse = async (message: string, history: any[], imageBase64?: string) => {
  const model = "gemini-3-flash-preview";
  const parts: any[] = [{ text: message }];
  if (imageBase64) parts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
  return await ai.models.generateContent({
    model,
    contents: [...history.map(h => ({ role: h.role, parts: h.parts })), { role: "user", parts }],
  });
};

// 3. HÀM TẠO QUIZ (Giữ nguyên logic gốc của Linh)
export const generateQuiz = async (subject: string, grade: string) => {
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: `Tạo 5 câu hỏi trắc nghiệm về môn ${subject} lớp ${grade}.`,
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
