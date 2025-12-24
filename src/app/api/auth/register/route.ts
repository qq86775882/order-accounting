import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, signToken } from '@/lib/auth';

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
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 409 }
      );
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建新用户
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username,
          password: hashedPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('创建用户失败:', insertError);
      return NextResponse.json(
        { error: '创建用户失败', details: insertError.message },
        { status: 500 }
      );
    }

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
  } catch (error: any) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: '注册失败', details: error.message },
      { status: 500 }
    );
  }
}