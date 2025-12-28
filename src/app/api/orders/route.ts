import { NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';
import { pool } from '@/lib/mysql';
import { getCurrentUser } from '@/lib/auth-server';

interface OrderRow {
  id: string;
  content: string;
  order_number: string;
  status: string;
  amount: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface OrderUpdateData {
  content?: string;
  orderNumber?: string;
  status?: string;
  amount?: number;
}

// GET /api/orders - 获取当前用户的所有订单
export async function GET() {
  try {
    console.log('GET /api/orders called');
    
    // 获取当前登录用户
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未认证' }, { status: 401 });
    }

    // 从MySQL获取当前用户的所有订单
    const connection = await pool.getConnection();
    try {
      await connection.query('USE orders_all;');
      
      const result = await connection.query(
        'SELECT id, content, order_number, status, amount, user_id, created_at, updated_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [user.userId]
      );
      const rows = result[0] as OrderRow[];
      
      // 转换数据格式以匹配前端期望的格式
      const orders = rows.map((order) => ({
        id: order.id,
        content: order.content,
        orderNumber: order.order_number,
        status: order.status,
        amount: parseFloat(order.amount.toString()),
        userId: order.user_id,
        createdAt: order.created_at,
        updatedAt: order.updated_at
      }));
      
      console.log('成功获取订单列表，数量:', orders.length);
      return NextResponse.json({ data: orders });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('MySQL获取订单失败:', error);
    return NextResponse.json({ 
      error: '获取订单列表失败', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}

// POST /api/orders - 创建新订单
export async function POST(request: Request) {
  try {
    console.log('POST /api/orders called');
    
    // 获取当前登录用户
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未认证' }, { status: 401 });
    }
    
    const orderData = await request.json();
    console.log('接收到订单数据:', orderData);
    
    // 准备插入到MySQL的数据
    const newOrder = {
      id: generateId(),
      content: orderData.content,
      order_number: orderData.orderNumber,
      status: orderData.status,
      amount: orderData.amount || 0,
      user_id: user.userId,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    // 插入新订单到MySQL
    const connection = await pool.getConnection();
    try {
      await connection.query('USE orders_all;');
      
      await connection.query(`
        INSERT INTO orders (id, content, order_number, status, amount, user_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        newOrder.id,
        newOrder.content,
        newOrder.order_number,
        newOrder.status,
        newOrder.amount,
        newOrder.user_id,
        newOrder.created_at,
        newOrder.updated_at
      ]);
      
      // 返回新创建的订单
      const createdOrder = {
        id: newOrder.id,
        content: newOrder.content,
        orderNumber: newOrder.order_number,
        status: newOrder.status,
        amount: newOrder.amount,
        userId: newOrder.user_id,
        createdAt: newOrder.created_at,
        updatedAt: newOrder.updated_at
      };
      
      console.log('订单创建成功，ID:', newOrder.id);
      return NextResponse.json({ data: createdOrder });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('MySQL创建订单失败:', error);
    return NextResponse.json({ 
      error: '创建订单失败', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}

// 生成UUID辅助函数
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}