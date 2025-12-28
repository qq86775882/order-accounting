'use client';

import { useState, useEffect } from 'react';
import { Order, createOrder, updateOrder, deleteOrder } from '@/lib/api';

interface OrderModalProps {
  mode: 'create' | 'edit';
  order?: Order | null;
  onClose: () => void;
  onOrderUpdate: () => void;
}

type OrderStatus = '已下单' | '已完成' | '已结算';

export default function OrderModal({ mode, order, onClose, onOrderUpdate }: OrderModalProps) {
  const [formData, setFormData] = useState({
    content: '',
    orderNumber: '',
    status: '已下单' as OrderStatus,
    amount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && order) {
      setFormData({
        content: order.content || '',
        orderNumber: order.orderNumber || '',
        status: order.status as OrderStatus || '已下单',
        amount: order.amount || 0,
      });
    } else {
      setFormData({
        content: '',
        orderNumber: '',
        status: '已下单',
        amount: 0,
      });
    }
  }, [mode, order]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
        await createOrder({
          content: formData.content,
          orderNumber: formData.orderNumber,
          status: formData.status,
          amount: formData.amount,
        });
      } else if (mode === 'edit' && order) {
        await updateOrder(order.id, {
          content: formData.content,
          orderNumber: formData.orderNumber,
          status: formData.status,
          amount: formData.amount,
        });
      }
      
      onOrderUpdate();
      onClose();
    } catch (err) {
      console.error(mode === 'create' ? '创建订单失败' : '更新订单失败', err);
      setError(mode === 'create' ? '创建订单失败' : '更新订单失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!order?.id) return;
    
    if (!window.confirm('确定要删除这个订单吗？此操作不可撤销。')) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteOrder(order.id);
      onOrderUpdate();
      onClose();
    } catch (err) {
      console.error('删除订单失败', err);
      setError('删除订单失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {mode === 'create' ? '新增订单' : '编辑订单'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  订单号
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入订单号"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  内容
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入订单内容"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  状态
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="已下单">已下单</option>
                  <option value="已完成">已完成</option>
                  <option value="已结算">已结算</option>
                </select>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  金额
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入金额"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  删除
                </button>
              )}
              
              <div className="flex space-x-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '保存中...' : (mode === 'create' ? '创建' : '保存')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}