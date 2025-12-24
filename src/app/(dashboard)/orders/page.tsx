'use client';

import { useState, useEffect, useRef } from 'react';
import OrderCard from '@/components/OrderCard';
import { getAllOrders } from '@/lib/api';
import { Order } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const itemsPerPage = 9; // 每页显示9条
  const observer = useRef<IntersectionObserver | null>(null);
  const lastOrderElementRef = useRef<HTMLDivElement>(null);

  // 获取订单数据
  const fetchOrders = async (page: number) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setIsFetching(true);
    }

    try {
      // 计算偏移量
      const offset = (page - 1) * itemsPerPage;
      
      // 获取所有订单并进行分页处理
      const allOrders = await getAllOrders();
      const paginatedOrders = allOrders.slice(offset, offset + itemsPerPage);
      
      if (page === 1) {
        setOrders(paginatedOrders);
      } else {
        setOrders(prevOrders => [...prevOrders, ...paginatedOrders]);
      }
      
      // 检查是否还有更多数据
      setHasMore(allOrders.length > offset + itemsPerPage);
    } catch (err) {
      console.error('获取订单失败:', err);
      setError('获取订单失败');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // 加载第一页数据
  useEffect(() => {
    fetchOrders(1);
  }, []);

  // 观察最后一个元素
  useEffect(() => {
    if (loading || isFetching || !hasMore) return;

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !isFetching) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    });

    if (lastOrderElementRef.current) {
      observer.current.observe(lastOrderElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, isFetching, hasMore]);

  // 当页码变化时获取新数据
  useEffect(() => {
    if (currentPage > 1) {
      fetchOrders(currentPage);
    }
  }, [currentPage]);

  // 重新加载订单
  const reloadOrders = () => {
    setCurrentPage(1);
    fetchOrders(1);
  };

  // 为最后一个订单添加ref
  const addLastOrderRef = (index: number) => {
    if (index === orders.length - 1) {
      return (node: HTMLDivElement) => {
        lastOrderElementRef.current = node;
      };
    }
    return null;
  };

  if (loading && orders.length === 0) {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">订单管理</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">暂无订单数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order, index) => (
            <div key={order.id} ref={index === orders.length - 1 ? addLastOrderRef(index) : null}>
              <OrderCard order={order} onOrderUpdate={reloadOrders} />
            </div>
          ))}
        </div>
      )}

      {/* 加载更多指示器 */}
      {isFetching && (
        <div className="flex justify-center mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* 没有更多数据提示 */}
      {!hasMore && orders.length > 0 && (
        <div className="text-center text-gray-500 mt-6 py-4">
          已加载全部订单
        </div>
      )}
    </div>
  );
}