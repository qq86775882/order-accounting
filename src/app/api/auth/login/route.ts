import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword, signToken } from '@/lib/auth';

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

    // 从Supabase获取用户
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }

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
  } catch (error: any) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { error: '登录失败', details: error.message },
      { status: 500 }
    );
  }
}