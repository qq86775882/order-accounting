import mysql from 'mysql2/promise';

// MySQL数据库配置
const dbConfig = {
  host: 'mysql6.sqlpub.com',
  port: 3311,
  user: 'orders_db',
  password: '3KNmSDws2y4JEmG0',
  database: 'orders_all',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // 移除MySQL2不支持的选项
  // acquireTimeout: 60000, // 60秒获取连接超时 - MySQL2不支持此选项
  // timeout: 60000, // 60秒查询超时 - MySQL2不支持此选项
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

export { pool };

// 定义类型
export interface Order {
  id: string;
  content: string;
  orderNumber: string;
  status: '已下单' | '已完成' | '已结算';
  amount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}