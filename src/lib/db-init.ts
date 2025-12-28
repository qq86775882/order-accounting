import { pool } from './mysql';

interface User {
  id: string;
}

// 创建表结构
export async function createTables() {
  try {
    console.log('开始创建数据库表...');
    
    // 连接到数据库（不指定具体数据库，用于创建数据库）
    const connection = await pool.getConnection();
    
    try {
      // 创建数据库（如果不存在）
      await connection.query(`CREATE DATABASE IF NOT EXISTS orders_all CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      console.log('数据库 orders_all 创建成功或已存在');
      
      // 使用数据库
      await connection.query('USE orders_all;');
      
      // 创建用户表
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(36) PRIMARY KEY,
          username VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('用户表 users 创建成功');
      
      // 创建订单表
      await connection.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(36) PRIMARY KEY,
          content TEXT NOT NULL,
          order_number VARCHAR(255) NOT NULL,
          status ENUM('已下单', '已完成', '已结算') NOT NULL DEFAULT '已下单',
          amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          user_id VARCHAR(36) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_order_number (order_number),
          INDEX idx_status (status),
          INDEX idx_created_at (created_at),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('订单表 orders 创建成功');
      
      // 插入默认管理员用户（如果不存在）- 使用固定的ID
      const adminUserId = 'admin-user-id';
      const result = await connection.query('SELECT id FROM users WHERE username = ?', ['admin']);
      const rows = result[0] as User[];
      if (rows.length === 0) {
        // 密码 "123456" 的哈希值，使用 bcrypt 生成
        await connection.query(`
          INSERT INTO users (id, username, password, created_at, updated_at) 
          VALUES (?, ?, ?, NOW(), NOW())
        `, [
          adminUserId, 
          'admin', 
          '$2a$10$8K1bQTMN0TVJ4wJ74FIYDeqH.PY0k.k7Z0iBZiG6xH307MyZxU7qO' // bcrypt哈希的"123456"
        ]);
        console.log('默认管理员用户创建成功');
      } else {
        console.log('管理员用户已存在');
      }
      
      console.log('数据库表创建完成');
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('创建数据库表时出错:', error);
    throw error;
  }
}

interface OrderData {
  id?: string;
  _id?: string;
  content?: string;
  title?: string;
  name?: string;
  orderNumber?: string;
  order_number?: string;
  status?: string;
  amount?: number;
  price?: number;
  userId?: string;
  user_id?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

// 导入订单数据
export async function importOrders(ordersData: OrderData[]) {
  try {
    console.log(`开始导入 ${ordersData.length} 条订单数据...`);
    
    const connection = await pool.getConnection();
    
    try {
      await connection.query('USE orders_all;');
      
      // 清空现有订单数据（保留用户数据）
      await connection.query('DELETE FROM orders WHERE user_id = ?', ['admin-user-id']);
      console.log('已清空现有订单数据');
      
      // 批量插入订单数据，将所有订单关联到管理员用户
      for (const order of ordersData) {
        await connection.query(`
          INSERT INTO orders (id, content, order_number, status, amount, user_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          order.id || order._id || generateId(),
          order.content || order.title || order.name || '',
          order.orderNumber || order.order_number || order.id || generateId(),
          order.status || '已下单',
          order.amount || order.price || 0,
          'admin-user-id', // 将所有订单关联到管理员用户
          order.createdAt || order.created_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
          order.updatedAt || order.updated_at || new Date().toISOString().slice(0, 19).replace('T', ' ')
        ]);
      }
      
      console.log(`成功导入 ${ordersData.length} 条订单数据`);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('导入订单数据时出错:', error);
    throw error;
  }
}

// 生成UUID辅助函数
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}