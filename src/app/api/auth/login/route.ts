import { NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';
import { verifyPassword, signToken } from '@/lib/auth';
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

    // 从MySQL获取用户
    const connection = await pool.getConnection();
    try {
      await connection.query('USE orders_all;');
      
      const result = await connection.query(
        'SELECT id, username, password, created_at, updated_at FROM users WHERE username = ?',
        [username]
      );
      const rows = result[0] as User[];
      
      if (rows.length === 0) {
        return NextResponse.json(
          { error: '用户名或密码错误' },
          { status: 401 }
        );
      }
      
      const user = rows[0];
      
      // 验证密码
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: '用户名或密码错误' },
          { status: 401 }
        );
      }

      // 生成JWT token
      const token = await signToken({
        userId: user.id,
        username: user.username,
      });

      // 设置认证cookie并返回响应
      const response = NextResponse.json({
        user: { id: user.id, username: user.username, created_at: user.created_at, updated_at: user.updated_at },
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
    console.error('登录失败:', error);
    return NextResponse.json(
      { error: '登录失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}