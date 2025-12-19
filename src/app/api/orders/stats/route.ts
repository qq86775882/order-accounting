import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export interface Order {
  id: string;
  content: string;
  orderNumber: string;
  status: '已下单' | '已完成' | '已结算';
  amount: number; // 新增订单金额字段
  created_at: Date;
  updated_at: Date;
}

// GET /api/orders/stats - 获取订单统计数据
export async function GET() {
  try {
    // 在本地开发环境中，如果没有配置数据库连接，则返回默认统计数据
    if (!process.env.VERCEL && !process.env.POSTGRES_URL) {
      return NextResponse.json({
        total: 0,
        pending: 0,
        completed: 0,
        settled: 0,
        pendingAmount: 0,
        completedAmount: 0,
        settledAmount: 0
      });
    }
    
    const result = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = '已下单' THEN 1 END) as pending,
        COUNT(CASE WHEN status = '已完成' THEN 1 END) as completed,
        COUNT(CASE WHEN status = '已结算' THEN 1 END) as settled,
        COALESCE(SUM(CASE WHEN status = '已下单' THEN amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN status = '已完成' THEN amount ELSE 0 END), 0) as completed_amount,
        COALESCE(SUM(CASE WHEN status = '已结算' THEN amount ELSE 0 END), 0) as settled_amount
      FROM orders
    `;
    
    const row = result.rows[0];
    
    const stats = {
      total: parseInt(row.total) || 0,
      pending: parseInt(row.pending) || 0,
      completed: parseInt(row.completed) || 0,
      settled: parseInt(row.settled) || 0,
      pendingAmount: parseFloat(row.pending_amount) || 0,
      completedAmount: parseFloat(row.completed_amount) || 0,
      settledAmount: parseFloat(row.settled_amount) || 0
    };
    
    // 设置正确的Content-Type头
    const response = NextResponse.json(stats);
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
  } catch (error) {
    console.error('获取统计数据失败:', error);
    // 在本地开发环境中，如果没有配置数据库连接，则返回默认统计数据
    if (!process.env.VERCEL && !process.env.POSTGRES_URL) {
      return NextResponse.json({
        total: 0,
        pending: 0,
        completed: 0,
        settled: 0,
        pendingAmount: 0,
        completedAmount: 0,
        settledAmount: 0
      });
    }
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 });
  }
}