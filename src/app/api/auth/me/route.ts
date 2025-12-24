import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth-server';

export async function GET() {
  try {
    // 获取当前登录用户
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未认证' }, { status: 401 });
    }

    // 从Supabase获取用户详细信息（不包含密码）
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, username, created_at, updated_at')
      .eq('id', user.userId)
      .single();

    if (error || !userData) {
      return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
    }

    return NextResponse.json(userData);
  } catch (error: any) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { error: '获取用户信息失败', details: error.message },
      { status: 500 }
    );
  }
}