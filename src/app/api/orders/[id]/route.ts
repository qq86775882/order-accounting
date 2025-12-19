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

// GET /api/orders/[id] - 获取特定订单
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 在本地开发环境中，如果没有配置数据库连接，则返回404
    if (!process.env.VERCEL && !process.env.POSTGRES_URL) {
      return NextResponse.json({ error: '数据库未配置' }, { status: 500 });
    }
    
    // 在Next.js 14中，params是一个Promise，需要await来解包
    const { id } = await params;
    
    const result = await sql`
      SELECT id, content, order_number, status, amount, created_at, updated_at
      FROM orders
      WHERE id = ${id}
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: '订单未找到' }, { status: 404 });
    }
    
    const row = result.rows[0];
    const order = {
      id: row.id,
      content: row.content,
      orderNumber: row.order_number,
      status: row.status,
      amount: parseFloat(row.amount) || 0,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString()
    };
    
    // 设置正确的Content-Type头
    const response = NextResponse.json(order);
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
  } catch (error) {
    console.error('获取订单失败:', error);
    return NextResponse.json({ error: '获取订单失败' }, { status: 500 });
  }
}

// PUT /api/orders/[id] - 更新特定订单
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 在本地开发环境中，如果没有配置数据库连接，则返回错误
    if (!process.env.VERCEL && !process.env.POSTGRES_URL) {
      return NextResponse.json({ error: '数据库未配置' }, { status: 500 });
    }
    
    // 在Next.js 14中，params是一个Promise，需要await来解包
    const { id } = await params;
    const orderData = await request.json();
    
    const result = await sql`
      UPDATE orders
      SET content = ${orderData.content}, 
          order_number = ${orderData.orderNumber}, 
          status = ${orderData.status}, 
          amount = ${orderData.amount || 0},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, content, order_number, status, amount, created_at, updated_at
    `;
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: '订单未找到' }, { status: 404 });
    }
    
    const row = result.rows[0];
    const updatedOrder = {
      id: row.id,
      content: row.content,
      orderNumber: row.order_number,
      status: row.status,
      amount: parseFloat(row.amount) || 0,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString()
    };
    
    // 设置正确的Content-Type头
    const response = NextResponse.json(updatedOrder);
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
  } catch (error) {
    console.error('更新订单失败:', error);
    return NextResponse.json({ error: '更新订单失败' }, { status: 500 });
  }
}

// DELETE /api/orders/[id] - 删除特定订单
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 在本地开发环境中，如果没有配置数据库连接，则返回错误
    if (!process.env.VERCEL && !process.env.POSTGRES_URL) {
      return NextResponse.json({ error: '数据库未配置' }, { status: 500 });
    }
    
    // 在Next.js 14中，params是一个Promise，需要await来解包
    const { id } = await params;
    
    const result = await sql`
      DELETE FROM orders
      WHERE id = ${id}
    `;
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: '订单未找到' }, { status: 404 });
    }
    
    // 设置正确的Content-Type头
    const response = NextResponse.json({ message: '订单删除成功' });
    response.headers.set('Content-Type', 'application/json; charset=utf-8');
    return response;
  } catch (error) {
    console.error('删除订单失败:', error);
    return NextResponse.json({ error: '删除订单失败' }, { status: 500 });
  }
}