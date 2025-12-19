'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Order, getOrderById, updateOrder } from '@/lib/api';

export default function EditOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [content, setContent] = useState('');
  const [amount, setAmount] = useState(''); // 新增金额状态
  const [status, setStatus] = useState<'已下单' | '已完成' | '已结算'>('已下单');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (id) {
          const order = await getOrderById(id);
          if (order) {
            setOrderNumber(order.orderNumber);
            setContent(order.content);
            setAmount(order.amount.toString()); // 设置金额
            setStatus(order.status as '已下单' | '已完成' | '已结算');
          } else {
            router.push('/orders');
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('获取订单失败:', err);
        setError('获取订单失败');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // 验证金额输入
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue < 0) {
      setError('请输入有效的金额');
      setSaving(false);
      return;
    }

    try {
      await updateOrder(id, {
        content,
        orderNumber,
        status,
        amount: amountValue
      });
      
      // 更新成功后跳转到订单列表页
      router.push('/orders');
      router.refresh();
    } catch (err) {
      console.error('更新订单失败:', err);
      setError('更新订单失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">编辑订单</h1>
        <p className="text-gray-600 mt-2">修改订单信息</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto form-card">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
              订单编号 *
            </label>
            <input
              type="text"
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="请输入订单编号"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              订单内容 *
            </label>
            <textarea
              id="content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="请输入订单内容"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              订单金额 *
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              placeholder="请输入订单金额"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              当前状态
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(['已下单', '已完成', '已结算'] as const).map((statusOption) => (
                <label 
                  key={statusOption}
                  className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    status === statusOption 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                      : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={statusOption}
                    checked={status === statusOption}
                    onChange={() => setStatus(statusOption)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-gray-700">{statusOption}</span>
                </label>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-sm text-sm font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition duration-200"
            >
              {saving ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </div>
              ) : '保存订单'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}