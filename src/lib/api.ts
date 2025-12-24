// API调用库文件，用于在客户端组件中与后端API交互

export interface Order {
  id: string;
  content: string;
  orderNumber: string;
  status: '已下单' | '已完成' | '已结算';
  amount: number; // 新增订单金额字段
  userId?: string; // 新增：关联用户ID
  createdAt: string;
  updatedAt: string;
}

// 获取所有订单
export async function getAllOrders(): Promise<Order[]> {
  try {
    const response = await fetch('/api/orders');
    if (!response.ok) {
      if (response.status === 401) {
        // 未认证，重定向到登录页
        window.location.href = '/login';
        return [];
      }
      throw new Error(`获取订单列表失败: ${response.status} ${response.statusText}`);
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
      if (response.status === 401) {
        // 未认证，重定向到登录页
        window.location.href = '/login';
        return null;
      }
      if (response.status === 404) {
        return null;
      }
      throw new Error(`获取订单失败: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('根据ID获取订单时出错:', error);
    return null;
  }
}

// 创建新订单
export async function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Order> {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // 未认证，重定向到登录页
        window.location.href = '/login';
        throw new Error('未认证');
      }
      throw new Error(`创建订单失败: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('创建订单时出错:', error);
    throw error;
  }
}

// 更新订单
export async function updateOrder(id: string, orderData: Partial<Omit<Order, 'id' | 'createdAt' | 'userId'>>): Promise<Order | null> {
  try {
    const response = await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // 未认证，重定向到登录页
        window.location.href = '/login';
        throw new Error('未认证');
      }
      if (response.status === 404) {
        return null;
      }
      throw new Error(`更新订单失败: ${response.status} ${response.statusText}`);
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
      if (response.status === 401) {
        // 未认证，重定向到登录页
        window.location.href = '/login';
        return false;
      }
      if (response.status === 404) {
        return false;
      }
      throw new Error(`删除订单失败: ${response.status} ${response.statusText}`);
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
      if (response.status === 401) {
        // 未认证，重定向到登录页
        window.location.href = '/login';
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
      throw new Error(`获取统计数据失败: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('获取订单统计数据时出错:', error);
    return {
      total: 0,
      pending: 0,
      completed: 0,
      settled: 0,
      pendingAmount: 0,
      completedAmount: 0,
      settledAmount: 0
    };
  }
}

// 用户注册
export async function registerUser(username: string, password: string) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '注册失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
}

// 用户登录
export async function loginUser(username: string, password: string) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '登录失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
}

// 用户登出
export async function logoutUser() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '登出失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('登出失败:', error);
    throw error;
  }
}

// 获取当前用户信息
export async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) {
      if (response.status === 401) {
        // 未认证，重定向到登录页
        window.location.href = '/login';
        return null;
      }
      throw new Error(`获取用户信息失败: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('获取用户信息时出错:', error);
    return null;
  }
}