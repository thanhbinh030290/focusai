import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email, password } = req.body;

  // TẠI ĐÂY: BẠN PHẢI VIẾT CODE TÌM TRONG DATABASE XEM EMAIL & PASS CÓ KHỚP KHÔNG
  // Giả lập tìm thấy tài khoản (sau khi bạn đã đăng ký):
  const isValidUser = true; // Chỗ này thay bằng logic check CSDL thật

  if (isValidUser) {
    return res.status(200).json({
      message: "Đăng nhập thành công!",
      user: {
        name: "Tên lấy từ CSDL",
        email: email,
        level: 1
      }
    });
  } else {
    return res.status(401).json({ error: 'Sai email hoặc mật khẩu' });
  }
}