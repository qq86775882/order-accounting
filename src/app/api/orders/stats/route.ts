import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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
    
    // 从Supabase获取当前用户的统计数据
    const { data, error } = await supabase
      .from('orders')
      .select('status, amount')
      .eq('user_id', user.userId);  // 只获取当前用户的数据
    
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