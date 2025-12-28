// import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import { createTables, importOrders } from '@/lib/db-init';
import { pool } from '@/lib/mysql';

interface Order {
  id: string;
  content: string;
  orderNumber: string;
  status: '已下单' | '已完成' | '已结算';
  amount: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

async function createAdminAndMigrate() {
  console.log('开始创建管理员账户并迁移数据...');

  try {
    // 1. 创建数据库表
    console.log('创建数据库表...');
    await createTables();

    // 2. 读取订单数据
    console.log('读取订单数据...');
    // 使用fs读取JSON数据
    const ordersData: Order[] = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'orders.json'), 'utf8')
    );
    
    // 3. 导入订单数据
    console.log('导入订单数据...');
    await importOrders(ordersData);

    console.log('管理员账户创建和数据迁移完成！');
    console.log('用户名: admin');
    console.log('密码: 123456');
  } catch (error) {
    console.error('创建管理员账户和迁移数据时出错:', error);
  }
}

// 运行脚本
if (require.main === module) {
  createAdminAndMigrate();
}

export default createAdminAndMigrate;