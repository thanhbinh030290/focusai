import { GoogleGenerativeAI } from "@google/generative-ai";

// KHỞI TẠO GEMINI (Sử dụng KEY từ biến môi trường Vercel)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY || "");

// --- ĐÂY LÀ HÀM ĐANG THIẾU KHIẾN VERCEL BÁO LỖI ---
export const getTutorStream = async (
  prompt: string, 
  history: any[], 
  imageBase64: string | undefined, 
  onChunk: (chunk: string) => void
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Cấu hình lịch sử chat để AI nhớ nội dung trước đó
    const chat = model.startChat({
      history: history.map(m => ({
        role: m.role,
        parts: [{ text: m.parts[0].text }]
      })),
    });

    let result;
    // Nếu Linh gửi kèm ảnh bài tập
    if (imageBase64) {
      result = await model.generateContentStream([
        prompt || "Phân tích ảnh này giúp mình.",
        { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
      ]);
    } else {
      // Nếu chỉ gửi tin nhắn văn bản
      result = await chat.sendMessageStream(prompt);
    }

    // Kỹ thuật nhả chữ tức thì (Streaming)
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      onChunk(chunkText); // Gửi từng chữ về cho Tutor.tsx hiển thị ngay
    }
  } catch (error) {
    console.error("Lỗi Gia sư AI:", error);
    throw error;
  }
};

// --- HÀM TẠO CÂU HỎI CHO GAME SPACE RUNNER ---
export const generateQuiz = async (subject: string, grade: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Tạo 5 câu hỏi trắc nghiệm về môn ${subject}, lớp ${grade}. 
    Trả về JSON: { "quizzes": [ { "question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0, "explanation": "..." } ] }`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "");
    return JSON.parse(text);
  } catch (error) {
    console.error("Lỗi Quiz:", error);
    return { quizzes: [] };
  }
};
