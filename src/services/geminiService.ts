import { GoogleGenAI, Type } from "@google/genai";

// ĐÃ SỬA: Dùng import.meta.env để khớp với VITE_GEMINI_API_KEY trên Vercel của Linh
const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" 
});

// 1. HÀM STREAMING - GIÚP GIA SƯ NHẢ CHỮ NGAY LẬP TỨC
export const getTutorStream = async (
  message: string, 
  history: { role: string, parts: { text: string }[] }[], 
  imageBase64: string | undefined,
  onChunk: (chunk: string) => void
) => {
  // GIỮ NGUYÊN MODEL GỐC CỦA LINH
  const model = "gemini-3-flash-preview";
  
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
        // GIỮ NGUYÊN SYSTEM INSTRUCTION GỐC CỦA LINH
        systemInstruction: `Bạn là FocusAI, một trợ lý học tập thông minh, hiện đại và đa năng (tương tự ChatGPT, Claude, Gemini).
        Nhiệm vụ của bạn là giải thích kiến thức, hỗ trợ giải bài tập và khuyến khích Linh tập trung học tập.`,
      },
    });

    // Nhả chữ về cho giao diện ngay khi có dữ liệu
    for await (const chunk of result.stream) {
      const chunkText = chunk.text; // Dùng .text theo thư viện genai mới
      if (chunkText) onChunk(chunkText);
    }
  } catch (error) {
    console.error("Lỗi Stream:", error);
    throw error;
  }
};

// 2. HÀM CŨ CỦA LINH (GIỮ LẠI ĐỂ KHÔNG LỖI CÁC TRANG KHÁC)
export const getTutorResponse = async (message: string, history: any[], imageBase64?: string) => {
  const model = "gemini-3-flash-preview";
  const parts: any[] = [{ text: message }];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64 } });
  }
  return await ai.models.generateContent({
    model,
    contents: [
      ...history.map(h => ({ role: h.role, parts: h.parts })),
      { role: "user", parts }
    ],
  });
};

// 3. HÀM TẠO QUIZ (GIỮ NGUYÊN JSON SCHEMA CỦA LINH)
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
