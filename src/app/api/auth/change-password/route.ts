import { NextResponse } from 'next/server';
import { pool } from '@/lib/mysql';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { getCurrentUser } from '@/lib/auth-server';

interface User {
  id: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/auth/change-password called');
    
    // 获取当前登录用户
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未认证' }, { status: 401 });
    }
    
    const { currentPassword, newPassword } = await request.json();
    
    // 验证输入
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '当前密码和新密码不能为空' },
        { status: 400 }
      );
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '新密码长度至少为6位' },
        { status: 400 }
      );
    }
    
    // 从MySQL获取用户信息（包含密码）
    const connection = await pool.getConnection();
    try {
      await connection.query('USE orders_all;');
      
      const result = await connection.query(
        'SELECT id, password FROM users WHERE id = ?',
        [user.userId]
      );
      const rows = result[0] as User[];
      
      if (rows.length === 0) {
        return NextResponse.json(
          { error: '用户不存在' },
          { status: 404 }
        );
      }
      
      const userData = rows[0];
      const isValidPassword = await verifyPassword(currentPassword, userData.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: '当前密码错误' },
          { status: 400 }
        );
      }
      
      // 加密新密码
      const hashedNewPassword = await hashPassword(newPassword);
      
      // 更新数据库中的密码
      await connection.query(
        'UPDATE users SET password = ?, updated_at = ? WHERE id = ?',
        [hashedNewPassword, new Date().toISOString().slice(0, 19).replace('T', ' '), user.userId]
      );
      
      return NextResponse.json({ message: '密码修改成功' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('修改密码失败:', error);
    return NextResponse.json(
      { error: '修改密码失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}