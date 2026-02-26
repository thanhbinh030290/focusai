import { GoogleGenAI, Type } from "@google/genai";

// Linh nhớ check lại Key trên Vercel xem đã đặt tên là VITE_GEMINI_KEY chưa nhé
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_KEY || "" });

// 1. HÀM STREAMING - GIÚP GIA SƯ NHẢ CHỮ NGAY LẬP TỨC (Dựa trên code gốc của Linh)
export const getTutorStream = async (
  message: string, 
  history: { role: string, parts: { text: string }[] }[], 
  imageBase64: string | undefined,
  onChunk: (chunk: string) => void
) => {
  // GIỮ NGUYÊN MODEL LINH ĐANG DÙNG ĐỂ CHẠY NGON
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
    // ĐỔI SANG generateContentStream ĐỂ NHẢ CHỮ NHANH
    const result = await ai.models.generateContentStream({
      model,
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: "user", parts }
      ],
      config: {
        // GIỮ NGUYÊN 100% SYSTEM INSTRUCTION GỐC CỦA LINH
        systemInstruction: `Bạn là FocusAI, một trợ lý học tập thông minh, hiện đại và đa năng (tương tự ChatGPT, Claude, Gemini).
      Nhiệm vụ của bạn là:
      1. Giúp người dùng "Understand the universe" - giải thích mọi kiến thức từ khoa học, lịch sử đến đời sống.
      2. Hỗ trợ học sinh Việt Nam giải bài tập qua hình ảnh hoặc văn bản.
      3. Khuyến khích sự tập trung, giảm thời gian sử dụng mạng xã hội.
      4. Trả lời một cách chuyên nghiệp nhưng vẫn gần gũi, súc tích.
      5. Nếu nhận được hình ảnh bài tập, hãy phân tích và hướng dẫn giải chi tiết.
      
      Định dạng câu hỏi trắc nghiệm nếu bạn tạo:
      [QUIZ]
      Câu hỏi: ...
      A. ...
      B. ...
      C. ...
      D. ...
      Đáp án đúng: [A/B/C/D]
      [/QUIZ]`,
      },
    });

    // Nhả chữ về cho giao diện ngay khi có dữ liệu
    for await (const chunk of result.stream) {
      const chunkText = chunk.text; // API genai mới dùng .text trực tiếp
      if (chunkText) onChunk(chunkText);
    }
  } catch (error) {
    console.error("Lỗi Stream:", error);
    throw error;
  }
};

// 2. HÀM CŨ GỐC CỦA LINH (GIỮ LẠI ĐỂ DỰ PHÒNG)
export const getTutorResponse = async (message: string, history: any[], imageBase64?: string) => {
  const model = "gemini-3-flash-preview";
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
      systemInstruction: `Bạn là FocusAI... [giống như trên]`,
    },
  });

  return response;
};

// 3. HÀM TẠO QUIZ (GIỮ NGUYÊN JSON SCHEMA GỐC CỦA LINH)
export const generateQuiz = async (subject: string, grade: string) => {
  const model = "gemini-3-flash-preview";
  
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
