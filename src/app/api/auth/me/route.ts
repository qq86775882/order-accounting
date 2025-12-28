import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';
// import { supabase } from '@/lib/supabase';
import { pool } from '@/lib/mysql';

export async function GET() {
  try {
    // 验证JWT令牌
    const user = await verifyToken();
    if (!user) {
      return NextResponse.json({ error: '未认证' }, { status: 401 });
    }

    // 从MySQL获取用户信息（不包含密码）
    const connection = await pool.getConnection();
    try {
      await connection.query('USE orders_all;');
      
      const [rows]: any = await connection.query(
        'SELECT id, username, created_at, updated_at FROM users WHERE id = ?',
        [user.userId]
      );
      
      if (rows.length === 0) {
        return NextResponse.json({ error: '用户不存在' }, { status: 404 });
      }
      
      const userData = rows[0];
      const userInfo = {
        id: userData.id,
        username: userData.username,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      };
      
      return NextResponse.json({ data: userInfo });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 });
  }
}