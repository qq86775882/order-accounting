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

// 初始化数据库表
async function initializeDatabase() {
  try {
    // 只在Vercel环境中尝试初始化数据库
    if (process.env.VERCEL) {
      await sql`
        CREATE TABLE IF NOT EXISTS orders (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          content TEXT NOT NULL,
          order_number VARCHAR(50) NOT NULL,
          status VARCHAR(10) NOT NULL CHECK (status IN ('已下单', '已完成', '已结算')),
          amount DECIMAL(10, 2) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
    }
  } catch (error) {
    console.error('初始化数据库表失败:', error);
  }
}

// GET /api/orders - 获取所有订单
export async function GET() {
  try {
    // 在本地开发环境中，如果没有配置数据库连接，则返回空数组
    if (!process.env.VERCEL && !process.env.POSTGRES_URL) {
      return NextResponse.json([]);
    }
    
    await initializeDatabase();
    
    const result = await sql`
      SELECT id, content, order_number, status, amount, created_at, updated_at
      FROM orders
      ORDER BY created_at DESC
    `;
    
    const orders = result.rows.map((row: any) => ({
      id: row.id,
      content: row.content,
      orderNumber: row.order_number,
      status: row.status,
      amount: parseFloat(row.amount) || 0,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString()
    }));
    
    // 设置正确的Content-Type头
    const response = NextResponse.json(orders);
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
  } catch (error) {
    console.error('获取订单列表失败:', error);
    // 在本地开发环境中，如果没有配置数据库连接，则返回空数组
    if (!process.env.VERCEL && !process.env.POSTGRES_URL) {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: '获取订单列表失败' }, { status: 500 });
  }
}

// POST /api/orders - 创建新订单
export async function POST(request: Request) {
  try {
    // 在本地开发环境中，如果没有配置数据库连接，则返回错误
    if (!process.env.VERCEL && !process.env.POSTGRES_URL) {
      return NextResponse.json({ error: '数据库未配置' }, { status: 500 });
    }
    
    await initializeDatabase();
    
    const orderData = await request.json();
    
    const result = await sql`
      INSERT INTO orders (content, order_number, status, amount)
      VALUES (${orderData.content}, ${orderData.orderNumber}, ${orderData.status}, ${orderData.amount || 0})
      RETURNING id, content, order_number, status, amount, created_at, updated_at
    `;
    
    const row = result.rows[0];
    const newOrder = {
      id: row.id,
      content: row.content,
      orderNumber: row.order_number,
      status: row.status,
      amount: parseFloat(row.amount) || 0,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString()
    };
    
    // 设置正确的Content-Type头
    const response = NextResponse.json(newOrder, { status: 201 });
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 });
  }
}

// GET /api/orders/stats - 获取订单统计数据
export async function GET_STATS() {
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
    
    await initializeDatabase();
    
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