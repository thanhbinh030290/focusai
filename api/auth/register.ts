import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email, password, name } = req.body;

  // TẠI ĐÂY: BẠN PHẢI VIẾT CODE LƯU VÀO DATABASE (SQL, MongoDB...)
  // Ví dụ giả lập lưu thành công:
  console.log(`Đã lưu user mới vào CSDL: ${name}, ${email}, ${password}`);

  return res.status(200).json({
    message: "Đăng ký thành công!",
    user: {
      name: name,
      email: email,
      level: 1,
      exp: 0,
      coins: 0
    }
  });
}