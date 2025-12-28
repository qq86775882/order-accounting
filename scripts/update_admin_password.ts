import { pool } from '../src/lib/mysql';
import { hash } from 'bcryptjs';

interface User {
  id: string;
  username: string;
  password: string;
}

async function updateAdminPassword() {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.query('USE orders_all;');
      
      // 生成 "123456" 的正确哈希值
      const newPassword = '123456';
      const hashedPassword = await hash(newPassword, 12);
      
      console.log('Updating admin password to:', hashedPassword);
      
      // 更新管理员用户密码
      await connection.query(
        'UPDATE users SET password = ? WHERE username = ?',
        [hashedPassword, 'admin']
      );
      
      console.log('Admin password updated successfully!');
      
      // 验证更新
      const result = await connection.query(
        'SELECT id, username, password FROM users WHERE username = ?',
        ['admin']
      );
      const users = result[0] as User[];
      
      console.log('Updated user record:', users[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating admin password:', error);
  }
}

updateAdminPassword();