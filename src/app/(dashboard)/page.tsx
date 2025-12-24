'use client';

import { useState, useEffect } from 'react';
import { getOrderStatistics } from '@/lib/api';
import Notification from '@/components/Notification';
import Link from 'next/link';

interface OrderStats {
  total: number;
  pending: number;
  completed: number;
  settled: number;
  pendingAmount: number;
  completedAmount: number;
  settledAmount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleNotificationClose = () => {
    setNotification(null);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getOrderStatistics();
        setStats(data);
      } catch (err) {
        console.error('获取统计数据失败:', err);
        setError('获取统计数据失败');
        setNotification({ message: '获取统计数据失败', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">错误: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  // 计算总金额和折算金额
  const totalAmount = (stats?.pendingAmount || 0) + (stats?.completedAmount || 0) + (stats?.settledAmount || 0);
  const convertedAmount = totalAmount * 0.6;

  return (
    <div className="w-full">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={handleNotificationClose} 
        />
      )}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">仪表盘</h1>
        <p className="text-gray-600">订单管理系统的概览</p>
      </div>

      {/* 统计卡片 - 移动端垂直排列，桌面端水平排列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* 总订单数卡片 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-3xl font-bold">{stats?.total || 0}</div>
          <div className="text-blue-100 mt-1">总订单数</div>
        </div>

        {/* 已下单卡片 */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-3xl font-bold">{stats?.pending || 0}</div>
          <div className="text-yellow-100 mt-1">已下单</div>
        </div>

        {/* 已完成卡片 */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-3xl font-bold">{stats?.completed || 0}</div>
          <div className="text-green-100 mt-1">已完成</div>
        </div>

        {/* 已结算卡片 */}
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-3xl font-bold">{stats?.settled || 0}</div>
          <div className="text-indigo-100 mt-1">已结算</div>
        </div>
      </div>

      {/* 金额统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">总金额</h3>
          <div className="text-3xl font-bold text-gray-900">¥{totalAmount.toFixed(2)}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">折算金额</h3>
          <div className="text-3xl font-bold text-gray-900">¥{convertedAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* 订单状态分布 - 使用响应式设计 */}
      <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">订单状态分布</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
            <div className="text-gray-600">已下单</div>
            <div className="text-sm text-gray-500 mt-1">金额: ¥{(stats?.pendingAmount || 0).toFixed(2)}</div>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats?.completed || 0}</div>
            <div className="text-gray-600">已完成</div>
            <div className="text-sm text-gray-500 mt-1">金额: ¥{(stats?.completedAmount || 0).toFixed(2)}</div>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-indigo-600">{stats?.settled || 0}</div>
            <div className="text-gray-600">已结算</div>
            <div className="text-sm text-gray-500 mt-1">金额: ¥{(stats?.settledAmount || 0).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* 移动端友好的导航按钮 */}
      <div className="mt-8 text-center">
        <Link 
          href="/orders"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          进入订单管理
        </Link>
      </div>
    </div>
  );
}