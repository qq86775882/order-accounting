'use client';

import { useState, useEffect } from 'react';
import { getOrderStatistics } from '@/lib/api';
import Link from 'next/link';

interface Statistics {
  total: number;
  pending: number;
  completed: number;
  settled: number;
  pendingAmount: number; // 已下单金额
  completedAmount: number; // 已完成金额
  settledAmount: number;   // 已结算金额
}

export default function HomePage() {
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    pending: 0,
    completed: 0,
    settled: 0,
    pendingAmount: 0,
    completedAmount: 0,
    settledAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const stats = await getOrderStatistics();
        setStatistics(stats);
        setLoading(false);
      } catch (error) {
        console.error('获取统计数据失败:', error);
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  // 计算最大订单数用于设置柱状图高度比例
  const maxCount = Math.max(statistics.pending, statistics.completed, statistics.settled, 1);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">订单仪表盘</h1>
        <p className="text-gray-600 mt-2">实时查看订单统计数据和业务概况</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stats-grid">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform transition-transform duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-400 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-blue-100">总订单数</p>
              <p className="text-3xl font-bold">{statistics.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white transform transition-transform duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-400 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-yellow-100">已下单</p>
              <p className="text-3xl font-bold">{statistics.pending}</p>
              <p className="text-yellow-100 text-sm mt-1">¥{statistics.pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform transition-transform duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="rounded-full bg-green-400 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-green-100">已完成</p>
              <p className="text-3xl font-bold">{statistics.completed}</p>
              <p className="text-green-100 text-sm mt-1">¥{statistics.completedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white transform transition-transform duration-300 hover:scale-105">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-400 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-purple-100">已结算</p>
              <p className="text-3xl font-bold">{statistics.settled}</p>
              <p className="text-purple-100 text-sm mt-1">¥{statistics.settledAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">订单状态分布</h2>
        <div className="flex flex-col sm:flex-row items-end h-64 gap-8 mt-8 justify-center chart-container">
          {/* 已下单柱状图 */}
          <div className="flex flex-col items-center flex-1 chart-bar">
            <div className="text-center mb-2">
              <span className="font-medium text-gray-900">已下单</span>
              <span className="block text-sm text-gray-500 mt-1">{statistics.pending} 单</span>
              <span className="block text-xs text-gray-400 mt-1">¥{statistics.pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div 
              className="w-3/4 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg hover:from-yellow-600 hover:to-yellow-500 transition-all duration-300 shadow-md flex items-end justify-center pb-2"
              style={{ 
                height: `${maxCount > 0 ? Math.max((statistics.pending / maxCount) * 200, 20) : 20}px`,
                minHeight: '20px'
              }}
            >
              {statistics.pending > 0 && (
                <span className="text-white text-xs font-bold">
                  {statistics.pending}
                </span>
              )}
            </div>
          </div>
          
          {/* 已完成柱状图 */}
          <div className="flex flex-col items-center flex-1 chart-bar">
            <div className="text-center mb-2">
              <span className="font-medium text-gray-900">已完成</span>
              <span className="block text-sm text-gray-500 mt-1">{statistics.completed} 单</span>
              <span className="block text-xs text-gray-400 mt-1">¥{statistics.completedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div 
              className="w-3/4 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg hover:from-green-600 hover:to-green-500 transition-all duration-300 shadow-md flex items-end justify-center pb-2"
              style={{ 
                height: `${maxCount > 0 ? Math.max((statistics.completed / maxCount) * 200, 20) : 20}px`,
                minHeight: '20px'
              }}
            >
              {statistics.completed > 0 && (
                <span className="text-white text-xs font-bold">
                  {statistics.completed}
                </span>
              )}
            </div>
          </div>
          
          {/* 已结算柱状图 */}
          <div className="flex flex-col items-center flex-1 chart-bar">
            <div className="text-center mb-2">
              <span className="font-medium text-gray-900">已结算</span>
              <span className="block text-sm text-gray-500 mt-1">{statistics.settled} 单</span>
              <span className="block text-xs text-gray-400 mt-1">¥{statistics.settledAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div 
              className="w-3/4 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg hover:from-purple-600 hover:to-purple-500 transition-all duration-300 shadow-md flex items-end justify-center pb-2"
              style={{ 
                height: `${maxCount > 0 ? Math.max((statistics.settled / maxCount) * 200, 20) : 20}px`,
                minHeight: '20px'
              }}
            >
              {statistics.settled > 0 && (
                <span className="text-white text-xs font-bold">
                  {statistics.settled}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link 
          href="/dashboard/orders"
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