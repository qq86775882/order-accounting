import { NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';
import { pool } from '@/lib/mysql';
import { getCurrentUser } from '@/lib/auth-server';

// GET /api/orders/stats - 获取当前用户的订单统计数据
export async function GET() {
  try {
    console.log('GET /api/orders/stats called');
    
    // 获取当前登录用户
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未认证' }, { status: 401 });
    }
    
    // 从MySQL获取当前用户的统计数据
    const connection = await pool.getConnection();
    try {
      await connection.query('USE orders_all;');
      
      const [rows]: any = await connection.query(
        'SELECT status, amount FROM orders WHERE user_id = ?',
        [user.userId]
      );
      
      // 计算统计数据
      const total = rows.length;
      const pending = rows.filter((order: any) => order.status === '已下单').length;
      const completed = rows.filter((order: any) => order.status === '已完成').length;
      const settled = rows.filter((order: any) => order.status === '已结算').length;
      
      // 计算金额统计
      const pendingAmount = rows
        .filter((order: any) => order.status === '已下单')
        .reduce((sum: number, order: any) => sum + parseFloat(order.amount), 0);
      
      const completedAmount = rows
        .filter((order: any) => order.status === '已完成')
        .reduce((sum: number, order: any) => sum + parseFloat(order.amount), 0);
      
      const settledAmount = rows
        .filter((order: any) => order.status === '已结算')
        .reduce((sum: number, order: any) => sum + parseFloat(order.amount), 0);
      
      const stats = {
        total,
        pending,
        completed,
        settled,
        pendingAmount,
        completedAmount,
        settledAmount
      };
      
      console.log('成功获取统计数据:', stats);
      return NextResponse.json(stats);
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('MySQL获取统计数据失败:', error);
    return NextResponse.json({ 
      error: '获取统计数据失败', 
      details: error.message,
      // 返回默认统计数据
      total: 0,
      pending: 0,
      completed: 0,
      settled: 0,
      pendingAmount: 0,
      completedAmount: 0,
      settledAmount: 0
    }, { status: 500 });
  }
}