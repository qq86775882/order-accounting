import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 清除认证cookie并返回响应
    const response = NextResponse.json({ message: '登出成功' });
    response.cookies.delete('token');

    return response;
  } catch (error: any) {
    console.error('登出失败:', error);
    return NextResponse.json(
      { error: '登出失败', details: error.message },
      { status: 500 }
    );
  }
}