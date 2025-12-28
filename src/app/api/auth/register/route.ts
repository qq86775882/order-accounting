import { NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';
import { hashPassword, signToken } from '@/lib/auth';
import { pool } from '@/lib/mysql';

interface User {
  id: string;
  username: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6位' },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const connection = await pool.getConnection();
    try {
      await connection.query('USE orders_all;');
      
      const result = await connection.query(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );
      const rows = result[0] as User[];
      
      if (rows.length > 0) {
        return NextResponse.json(
          { error: '用户名已存在' },
          { status: 409 }
        );
      }

      // 加密密码
      const hashedPassword = await hashPassword(password);

      // 生成用户ID
      const userId = generateId();

      // 创建新用户
      await connection.query(
        'INSERT INTO users (id, username, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [userId, username, hashedPassword, new Date().toISOString().slice(0, 19).replace('T', ' '), new Date().toISOString().slice(0, 19).replace('T', ' ')]
      );

      // 获取新创建的用户
      const newUserResult = await connection.query(
        'SELECT id, username, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );
      const newUserRows = newUserResult[0] as User[];
      const newUser = newUserRows[0];

      // 生成JWT token
      const token = await signToken({
        userId: newUser.id,
        username: newUser.username,
      });

      // 设置认证cookie并返回响应
      const response = NextResponse.json({
        user: { id: newUser.id, username: newUser.username, created_at: newUser.created_at, updated_at: newUser.updated_at },
        token,
      });
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30天
        path: '/',
        sameSite: 'strict',
      });

      return response;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: '注册失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// 生成UUID辅助函数
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}