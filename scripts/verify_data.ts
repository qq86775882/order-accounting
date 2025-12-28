import { pool } from '../src/lib/mysql';

interface User {
  id: string;
  username: string;
  password: string;
}

interface Order {
  id: string;
  content: string;
  order_number: string;
  user_id: string;
}

interface CountResult {
  count: number;
}

async function verifyData() {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.query('USE orders_all;');
      
      // 检查管理员用户（包含密码字段）
      const result = await connection.query('SELECT id, username, password FROM users WHERE username = ?', ['admin']);
      const users = result[0] as User[];
      console.log('Admin users found:', users);
      
      if (users.length > 0) {
        console.log('Password hash for admin user:', users[0].password);
      }
      
      // 检查订单数量
      const orderCountResult = await connection.query('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', ['admin-user-id']);
      const orderCounts = orderCountResult[0] as CountResult[];
      console.log('Orders for admin-user-id:', orderCounts);
      
      // 检查所有订单数量
      const allOrderResult = await connection.query('SELECT COUNT(*) as count FROM orders');
      const allOrders = allOrderResult[0] as CountResult[];
      console.log('Total orders:', allOrders);
      
      // 检查所有用户
      const allUsersResult = await connection.query('SELECT id, username FROM users');
      const allUsers = allUsersResult[0] as User[];
      console.log('All users:', allUsers);
      
      // 检查订单详情
      const sampleOrderResult = await connection.query('SELECT id, content, order_number, user_id FROM orders LIMIT 5');
      const sampleOrders = sampleOrderResult[0] as Order[];
      console.log('Sample orders:', sampleOrders);
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error verifying data:', error);
  }
}

verifyData();