import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/orders/[id] - 获取特定订单
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('GET /api/orders/[id] called');
    
    // 在Next.js 14中，params是一个Promise，需要await来解包
    const { id } = await params;
    console.log('订单ID:', id);
    
    // 从Supabase获取特定订单
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Supabase获取订单失败:', error);
      // 处理连接超时错误
      if (error.message.includes('fetch failed') || error.message.includes('Connect Timeout Error')) {
        return NextResponse.json({ 
          error: '连接Supabase超时', 
          details: '请检查网络连接或稍后重试'
        }, { status: 500 });
      }
      return NextResponse.json({ error: '获取订单失败', details: error.message }, { status: 500 });
    }
    
    if (!data) {
      console.log('订单未找到:', id);
      return NextResponse.json({ error: '订单未找到' }, { status: 404 });
    }
    
    // 转换数据格式以匹配前端期望的格式
    const order = {
      id: data.id,
      content: data.content,
      orderNumber: data.order_number,
      status: data.status,
      amount: data.amount,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    console.log('成功获取订单:', order.id);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('获取订单失败:', error);
    // 处理连接超时错误
    if (error.message.includes('fetch failed') || error.message.includes('Connect Timeout Error')) {
      return NextResponse.json({ 
        error: '连接Supabase超时', 
        details: '请检查网络连接或稍后重试'
      }, { status: 500 });
    }
    return NextResponse.json({ error: '获取订单失败', details: error.message || '未知错误' }, { status: 500 });
  }
}

// PUT /api/orders/[id] - 更新特定订单
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('PUT /api/orders/[id] called');
    
    // 在Next.js 14中，params是一个Promise，需要await来解包
    const { id } = await params;
    console.log('订单ID:', id);
    
    const orderData = await request.json();
    console.log('更新数据:', orderData);
    
    // 准备更新到Supabase的数据
    const updatedOrder = {
      content: orderData.content,
      order_number: orderData.orderNumber,
      status: orderData.status,
      amount: orderData.amount || 0,
      updated_at: new Date().toISOString()
    };
    
    // 更新Supabase中的订单
    const { data, error } = await supabase
      .from('orders')
      .update(updatedOrder)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase更新订单失败:', error);
      // 处理连接超时错误
      if (error.message.includes('fetch failed') || error.message.includes('Connect Timeout Error')) {
        return NextResponse.json({ 
          error: '连接Supabase超时', 
          details: '请检查网络连接或稍后重试'
        }, { status: 500 });
      }
      return NextResponse.json({ error: '更新订单失败', details: error.message }, { status: 500 });
    }
    
    if (!data) {
      console.log('订单未找到:', id);
      return NextResponse.json({ error: '订单未找到' }, { status: 404 });
    }
    
    // 转换数据格式以匹配前端期望的格式
    const updatedOrderResponse = {
      id: data.id,
      content: data.content,
      orderNumber: data.order_number,
      status: data.status,
      amount: data.amount,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    console.log('成功更新订单:', updatedOrderResponse.id);
    return NextResponse.json(updatedOrderResponse);
  } catch (error: any) {
    console.error('更新订单失败:', error);
    // 处理连接超时错误
    if (error.message.includes('fetch failed') || error.message.includes('Connect Timeout Error')) {
      return NextResponse.json({ 
        error: '连接Supabase超时', 
        details: '请检查网络连接或稍后重试'
      }, { status: 500 });
    }
    return NextResponse.json({ error: '更新订单失败', details: error.message || '未知错误' }, { status: 500 });
  }
}

// DELETE /api/orders/[id] - 删除特定订单
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('DELETE /api/orders/[id] called');
    
    // 在Next.js 14中，params是一个Promise，需要await来解包
    const { id } = await params;
    console.log('订单ID:', id);
    
    // 从Supabase删除订单
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase删除订单失败:', error);
      // 处理连接超时错误
      if (error.message.includes('fetch failed') || error.message.includes('Connect Timeout Error')) {
        return NextResponse.json({ 
          error: '连接Supabase超时', 
          details: '请检查网络连接或稍后重试'
        }, { status: 500 });
      }
      return NextResponse.json({ error: '删除订单失败', details: error.message }, { status: 500 });
    }
    
    console.log('成功删除订单:', id);
    return NextResponse.json({ message: '订单删除成功' });
  } catch (error: any) {
    console.error('删除订单失败:', error);
    // 处理连接超时错误
    if (error.message.includes('fetch failed') || error.message.includes('Connect Timeout Error')) {
      return NextResponse.json({ 
        error: '连接Supabase超时', 
        details: '请检查网络连接或稍后重试'
      }, { status: 500 });
    }
    return NextResponse.json({ error: '删除订单失败', details: error.message || '未知错误' }, { status: 500 });
  }
}