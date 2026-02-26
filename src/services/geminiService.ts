import { GoogleGenAI, Type } from "@google/genai";

// ĐÃ SỬA: Khớp chính xác với tên VITE_GEMINI_API_KEY trong ảnh Vercel của Linh
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
  // Sử dụng đúng model Gemini 3 Flash bản ổn định nhất hiện tại
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
        systemInstruction: `Bạn là FocusAI, trợ lý học tập thông minh của Linh. 
        Hãy giải bài tập chi tiết và gần gũi nhé!`,
      },
    });

    for await (const chunk of result.stream) {
      // Lưu ý: Thư viện genai bản mới dùng chunk.text
      const chunkText = chunk.text; 
      if (chunkText) onChunk(chunkText);
    }
  } catch (error) {
    console.error("Lỗi Stream:", error);
    throw error;
  }
};

// 2. HÀM TẠO QUIZ (Đã đồng bộ Key)
export const generateQuiz = async (subject: string, grade: string) => {
  const model = "gemini-1.5-flash";
  const response = await ai.models.generateContent({
    model,
    contents: `Tạo 5 câu hỏi trắc nghiệm môn ${subject} lớp ${grade}.`,
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
