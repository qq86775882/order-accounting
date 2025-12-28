'use client';

import { Order } from '@/lib/api';
import { useState, useEffect } from 'react';
import OrderModal from '@/components/OrderModal';
import { deleteOrder } from '@/lib/api';

interface OrderTableProps {
  orders: Order[];
  onOrderUpdate: () => void;
}

export default function OrderTable({ orders, onOrderUpdate }: OrderTableProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('全部');
  const [filterDate, setFilterDate] = useState<string>('');

  const handleEdit = (order: Order) => {
    setCurrentOrder(order);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCreate = () => {
    setCurrentOrder(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setTimeout(() => {
      setCurrentOrder(null);
    }, 300); // 等待动画结束
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm('确定要删除这个订单吗？')) {
      try {
        await deleteOrder(orderId);
        onOrderUpdate(); // 重新加载数据
      } catch (error) {
        console.error('删除订单失败:', error);
        alert('删除订单失败，请重试');
      }
    }
  };

  // 过滤和搜索订单
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === '全部' || order.status === filterStatus;
    
    const matchesDate = !filterDate || 
      new Date(order.createdAt).toLocaleDateString('zh-CN').includes(filterDate);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">订单管理</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            新增订单
          </button>
        </div>
      </div>

      {/* 搜索和筛选控件 */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              搜索
            </label>
            <input
              type="text"
              id="search"
              placeholder="搜索订单号或内容..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              状态筛选
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="全部">全部状态</option>
              <option value="已下单">已下单</option>
              <option value="已完成">已完成</option>
              <option value="已结算">已结算</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              日期筛选
            </label>
            <input
              type="text"
              id="date"
              placeholder="YYYY-MM-DD"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  序号
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单号
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  内容
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={order.content}>
                      {order.content}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${order.status === '已下单' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === '已完成' ? 'bg-green-100 text-green-800' : 
                          'bg-blue-100 text-blue-800'}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{order.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(order)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDelete(order.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    没有找到匹配的订单
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && orders.length > 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">没有找到匹配的订单</p>
          </div>
        )}

        {filteredOrders.length === 0 && orders.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">暂无订单数据</p>
          </div>
        )}
      </div>

      {/* 订单模态框 */}
      {showModal && (
        <OrderModal
          mode={modalMode}
          order={currentOrder}
          onClose={handleModalClose}
          onOrderUpdate={onOrderUpdate}
        />
      )}
    </div>
  );
}