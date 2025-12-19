import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/orders - 获取所有订单
export async function GET() {
  try {
    console.log('GET /api/orders called');
    
    // 从Supabase获取所有订单
    const { data, error } = await supabase
      .from('orders')
      .select('*')
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
    
    const orderData = await request.json();
    console.log('接收到订单数据:', orderData);
    
    // 准备插入到Supabase的数据
    const newOrder = {
      content: orderData.content,
      order_number: orderData.orderNumber,
      status: orderData.status,
      amount: orderData.amount || 0,
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

// GET /api/orders/stats - 获取订单统计数据
export async function GET_STATS() {
  try {
    console.log('GET /api/orders/stats called');
    
    // 从Supabase获取统计数据
    const { data, error } = await supabase
      .from('orders')
      .select('status, amount');
    
    if (error) {
      console.error('Supabase获取统计数据失败:', error);
      // 处理连接超时错误
      if (error.message.includes('fetch failed') || error.message.includes('Connect Timeout Error')) {
        return NextResponse.json({ 
          error: '连接Supabase超时', 
          details: '请检查网络连接或稍后重试',
          // 返回默认统计数据
          total: 0,
          pending: 0,
          completed: 0,
          settled: 0,
          pendingAmount: 0,
          completedAmount: 0,
          settledAmount: 0
        });
      }
      return NextResponse.json({ error: '获取统计数据失败', details: error.message }, { status: 500 });
    }
    
    // 计算统计数据
    const total = data.length;
    const pending = data.filter(order => order.status === '已下单').length;
    const completed = data.filter(order => order.status === '已完成').length;
    const settled = data.filter(order => order.status === '已结算').length;
    
    const pendingAmount = data
      .filter(order => order.status === '已下单')
      .reduce((sum, order) => sum + (order.amount || 0), 0);
      
    const completedAmount = data
      .filter(order => order.status === '已完成')
      .reduce((sum, order) => sum + (order.amount || 0), 0);
      
    const settledAmount = data
      .filter(order => order.status === '已结算')
      .reduce((sum, order) => sum + (order.amount || 0), 0);
    
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
  } catch (error: any) {
    console.error('获取统计数据失败:', error);
    // 处理连接超时错误
    if (error.message.includes('fetch failed') || error.message.includes('Connect Timeout Error')) {
      return NextResponse.json({ 
        error: '连接Supabase超时', 
        details: '请检查网络连接或稍后重试',
        // 返回默认统计数据
        total: 0,
        pending: 0,
        completed: 0,
        settled: 0,
        pendingAmount: 0,
        completedAmount: 0,
        settledAmount: 0
      });
    }
    return NextResponse.json({ error: '获取统计数据失败', details: error.message || '未知错误' }, { status: 500 });
  }
}