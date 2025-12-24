import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth-server';

// GET /api/orders - 获取当前用户的所有订单
export async function GET() {
  try {
    console.log('GET /api/orders called');
    
    // 获取当前登录用户
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: '未认证' }, { status: 401 });
    }

    // 从Supabase获取当前用户的所有订单
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.userId)  // 只获取当前用户的订单
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase获取订单失败:', error);
      // 处理连接超时错误
      if (error.message.includes('fetch failed') || error.message.includes('Connect Timeout Error')) {
        return NextResponse.json({ 
          error: '连接Supabase超时', 
          details: '请检查网络连接或稍后重试',
          data: [] // 返回空数组而不是错误
        });
      }
      return NextResponse.json({ error: '获取订单列表失败', details: error.message }, { status: 500 });
    }
    
    // 转换数据格式以匹配前端期望的格式
    const orders = data.map(order => ({
      id: order.id,
      content: order.content,
      orderNumber: order.order_number,
      status: order.status,
      amount: order.amount,
      userId: order.user_id,  // 包含用户ID
      createdAt: order.created_at,
      updatedAt: order.updated_at
    }));
    
    console.log('成功获取订单列表，数量:', orders.length);
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('获取订单列表失败:', error);
    // 处理连接超时错误
    if (error.message.includes('fetch failed') || error.message.includes('Connect Timeout Error')) {
      return NextResponse.json({ 
        error: '连接Supabase超时', 
        details: '请检查网络连接或稍后重试',
        data: [] // 返回空数组而不是错误
      });
    }
    return NextResponse.json({ error: '获取订单列表失败', details: error.message || '未知错误' }, { status: 500 });
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
    
    // 准备插入到Supabase的数据
    const newOrder = {
      content: orderData.content,
      order_number: orderData.orderNumber,
      status: orderData.status,
      amount: orderData.amount || 0,
      user_id: user.userId,  // 关联当前用户ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 插入新订单到Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert(newOrder)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase创建订单失败:', error);
      // 处理连接超时错误
      if (error.message.includes('fetch failed') || error.message.includes('Connect Timeout Error')) {
        return NextResponse.json({ 
          error: '连接Supabase超时', 
          details: '请检查网络连接或稍后重试'
        }, { status: 500 });
      }
      return NextResponse.json({ error: '创建订单失败', details: error.message }, { status: 500 });
    }
    
    // 转换数据格式以匹配前端期望的格式
    const createdOrder = {
      id: data.id,
      content: data.content,
      orderNumber: data.order_number,
      status: data.status,
      amount: data.amount,
      userId: data.user_id,  // 包含用户ID
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    console.log('成功创建订单:', createdOrder.id);
    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error: any) {
    console.error('创建订单失败:', error);
    // 处理连接超时错误
    if (error.message.includes('fetch failed') || error.message.includes('Connect Timeout Error')) {
      return NextResponse.json({ 
        error: '连接Supabase超时', 
        details: '请检查网络连接或稍后重试'
      }, { status: 500 });
    }
    return NextResponse.json({ error: '创建订单失败', details: error.message || '未知错误' }, { status: 500 });
  }
}