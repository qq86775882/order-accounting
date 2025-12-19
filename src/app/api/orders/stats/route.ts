import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/orders/stats - 获取订单统计数据
export async function GET() {
  try {
    console.log('GET /api/orders/stats called');
    
    // 检查数据库连接
    const { data: checkData, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('数据库连接检查失败:', checkError);
      // 如果是表不存在的错误，返回默认统计数据而不是错误
      if (checkError.message.includes('not found') || checkError.message.includes('Could not find the table')) {
        console.log('表不存在，返回默认统计数据');
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
      return NextResponse.json({ error: '数据库连接失败', details: checkError.message }, { status: 500 });
    }
    
    // 从Supabase获取统计数据
    const { data, error } = await supabase
      .from('orders')
      .select('status, amount');
    
    if (error) {
      console.error('Supabase获取统计数据失败:', error);
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
    return NextResponse.json({ error: '获取统计数据失败', details: error.message || '未知错误' }, { status: 500 });
  }
}