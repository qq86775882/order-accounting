import { NextResponse } from 'next/server';
import { pool } from '@/lib/mysql';
import { getCurrentUser } from '@/lib/auth-server';
import { unstable_noStore as noStore } from 'next/cache';

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

// GET /api/orders/[id] - 获取指定订单
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log('GET /api/orders/[id] called');
    
    // 获取当前登录用户
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未认证' }, { status: 401 });
    }
    
    // 从URL中获取订单ID
    const { id: orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: '订单ID不能为空' }, { status: 400 });
    }
    
    // 从MySQL获取订单
    const connection = await pool.getConnection();
    try {
      await connection.query('USE orders_all;');
      
      const result = await connection.query(
        'SELECT id, content, order_number, status, amount, user_id, created_at, updated_at FROM orders WHERE id = ? AND user_id = ?',
        [orderId, user.userId]
      );
      const rows = result[0] as OrderRow[];
      
      if (rows.length === 0) {
        return NextResponse.json({ error: '订单不存在或无权限访问' }, { status: 404 });
      }
      
      const order = {
        id: rows[0].id,
        content: rows[0].content,
        orderNumber: rows[0].order_number,
        status: rows[0].status,
        amount: parseFloat(rows[0].amount.toString()),
        userId: rows[0].user_id,
        createdAt: rows[0].created_at,
        updatedAt: rows[0].updated_at
      };
      
      console.log('成功获取订单，ID:', orderId);
      return NextResponse.json({ data: order });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('MySQL获取订单失败:', error);
    return NextResponse.json({ 
      error: '获取订单失败', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}

// PUT /api/orders/[id] - 更新指定订单
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log('PUT /api/orders/[id] called');
    
    // 获取当前登录用户
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未认证' }, { status: 401 });
    }
    
    // 从URL中获取订单ID
    const { id: orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: '订单ID不能为空' }, { status: 400 });
    }
    
    const orderData: OrderUpdateData = await request.json();
    console.log('接收到更新数据:', orderData);
    
    // 从MySQL获取当前订单并验证用户权限
    const connection = await pool.getConnection();
    try {
      await connection.query('USE orders_all;');
      
      // 首先检查订单是否存在且属于当前用户
      const existingResult = await connection.query(
        'SELECT id, user_id FROM orders WHERE id = ? AND user_id = ?',
        [orderId, user.userId]
      );
      const existingOrders = existingResult[0] as OrderRow[];
      
      if (existingOrders.length === 0) {
        return NextResponse.json({ error: '订单不存在或无权限访问' }, { status: 404 });
      }
      
      // 更新订单
      await connection.query(
        `UPDATE orders 
         SET content = ?, order_number = ?, status = ?, amount = ?, updated_at = ? 
         WHERE id = ? AND user_id = ?`,
        [
          orderData.content,
          orderData.orderNumber,
          orderData.status,
          orderData.amount,
          new Date().toISOString().slice(0, 19).replace('T', ' '),
          orderId,
          user.userId
        ]
      );
      
      // 获取更新后的订单
      const updatedResult = await connection.query(
        'SELECT id, content, order_number, status, amount, user_id, created_at, updated_at FROM orders WHERE id = ? AND user_id = ?',
        [orderId, user.userId]
      );
      const updatedOrders = updatedResult[0] as OrderRow[];

      const updatedOrder = updatedOrders[0] ? {
        id: updatedOrders[0].id,
        content: updatedOrders[0].content,
        orderNumber: updatedOrders[0].order_number,
        status: updatedOrders[0].status,
        amount: parseFloat(updatedOrders[0].amount.toString()),
        userId: updatedOrders[0].user_id,
        createdAt: updatedOrders[0].created_at,
        updatedAt: updatedOrders[0].updated_at
      } : null;
      
      console.log('订单更新成功，ID:', orderId);
      return NextResponse.json({ data: updatedOrder });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('MySQL更新订单失败:', error);
    return NextResponse.json({ 
      error: '更新订单失败', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}

// DELETE /api/orders/[id] - 删除指定订单
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    console.log('DELETE /api/orders/[id] called');
    
    // 获取当前登录用户
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未认证' }, { status: 401 });
    }
    
    // 从URL中获取订单ID
    const { id: orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: '订单ID不能为空' }, { status: 400 });
    }
    
    // 从MySQL删除订单
    const connection = await pool.getConnection();
    try {
      await connection.query('USE orders_all;');
      
      // 检查订单是否存在且属于当前用户
      const existingResult = await connection.query(
        'SELECT id FROM orders WHERE id = ? AND user_id = ?',
        [orderId, user.userId]
      );
      const existingOrders = existingResult[0] as OrderRow[];
      
      if (existingOrders.length === 0) {
        return NextResponse.json({ error: '订单不存在或无权限访问' }, { status: 404 });
      }
      
      // 删除订单
      await connection.query(
        'DELETE FROM orders WHERE id = ? AND user_id = ?',
        [orderId, user.userId]
      );
      
      console.log('订单删除成功，ID:', orderId);
      return NextResponse.json({ message: '订单删除成功' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('MySQL删除订单失败:', error);
    return NextResponse.json({ 
      error: '删除订单失败', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}