// API调用库文件，用于在客户端组件中与后端API交互

export interface Order {
  id: string;
  content: string;
  orderNumber: string;
  status: '已下单' | '已完成' | '已结算';
  amount: number; // 新增订单金额字段
  createdAt: string;
  updatedAt: string;
}

// 获取所有订单
export async function getAllOrders(): Promise<Order[]> {
  try {
    const response = await fetch('/api/orders');
    if (!response.ok) {
      throw new Error('获取订单列表失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取订单列表时出错:', error);
    return [];
  }
}

// 根据ID获取订单
export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const response = await fetch(`/api/orders/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('获取订单失败');
    }
    return await response.json();
  } catch (error) {
    console.error('根据ID获取订单时出错:', error);
    return null;
  }
}

// 创建新订单
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      throw new Error('创建订单失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('创建订单时出错:', error);
    throw error;
  }
}

// 更新订单
export async function updateOrder(id: string, orderData: Partial<Omit<Order, 'id' | 'createdAt'>>): Promise<Order | null> {
  try {
    const response = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('更新订单失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('更新订单时出错:', error);
    throw error;
  }
}

// 删除订单
export async function deleteOrder(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/orders/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return false;
      }
      throw new Error('删除订单失败');
    }
    
    return true;
  } catch (error) {
    console.error('删除订单时出错:', error);
    return false;
  }
}

// 获取订单统计数据
export async function getOrderStatistics() {
  try {
    const response = await fetch('/api/orders/stats');
    if (!response.ok) {
      throw new Error('获取统计数据失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取订单统计数据时出错:', error);
    return {
      total: 0,
      pending: 0,
      completed: 0,
      settled: 0,
      pendingAmount: 0, // 已下单金额
      completedAmount: 0, // 已完成金额
      settledAmount: 0   // 已结算金额
    };
  }
}