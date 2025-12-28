'use client';

import { useState, useEffect } from 'react';
import OrderTable from '@/components/OrderTable';
import { getAllOrders } from '@/lib/api';
import { Order } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取订单数据
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await getAllOrders();
      setOrders(allOrders);
    } catch (err) {
      console.error('获取订单失败:', err);
      setError('获取订单失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载数据
  useEffect(() => {
    fetchOrders();
  }, []);

  // 重新加载订单
  const reloadOrders = () => {
    fetchOrders();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">错误: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <OrderTable 
        orders={orders} 
        onOrderUpdate={reloadOrders} 
      />
    </div>
  );
}