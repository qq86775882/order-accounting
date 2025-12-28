'use client';

import { useState } from 'react';
import { Order, updateOrder, deleteOrder } from '@/lib/api';

interface OrderCardProps {
  order: Order;
  onOrderUpdate: () => void;
}

export default function OrderCard({ order, onOrderUpdate }: OrderCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(order.content);
  const [orderNumber, setOrderNumber] = useState(order.orderNumber);
  const [status, setStatus] = useState(order.status);
  const [amount, setAmount] = useState(order.amount.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    setLoading(true);
    setError(null);

    try {
      await updateOrder(order.id, {
        content,
        orderNumber,
        status,
        amount: parseFloat(amount),
      });
      setIsEditing(false);
      onOrderUpdate(); // 刷新订单列表
    } catch (err) {
      console.error('更新订单失败:', err);
      setError('更新订单失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这个订单吗？')) {
      return;
    }

    setLoading(true);
    try {
      await deleteOrder(order.id);
      onOrderUpdate(); // 刷新订单列表
    } catch (err) {
      console.error('删除订单失败:', err);
      setError('删除订单失败');
    } finally {
      setLoading(false);
    }
  };

  // 计算折算金额
  const convertedAmount = parseFloat(amount) * 0.6;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      {isEditing ? (
        <div className="p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">订单内容</label>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">订单号</label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">状态</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Order['status'])}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="已下单">已下单</option>
                <option value="已完成">已完成</option>
                <option value="已结算">已结算</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">金额</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                disabled={loading}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? '保存中...' : '保存'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900 truncate">{content}</h3>
              <p className="text-sm text-gray-500 mt-1">订单号: {orderNumber}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-700"
                title="编辑"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700"
                title="删除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mt-3">
            <div className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
              status === '已下单' 
                ? 'bg-yellow-100 text-yellow-800' 
                : status === '已完成' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
            }`}>
              {status}
            </div>
          </div>
          
          <div className="mt-3 text-sm">
            <p className="text-gray-700">总金额: <span className="font-semibold">¥{parseFloat(amount).toFixed(2)}</span></p>
            <p className="text-gray-700">折算金额: <span className="font-semibold">¥{convertedAmount.toFixed(2)}</span></p>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            创建时间: {new Date(order.createdAt).toLocaleString('zh-CN')}
          </div>
        </div>
      )}
    </div>
  );
}