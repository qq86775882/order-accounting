import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

async function createAdminAndMigrate() {
  console.log('开始创建管理员账户并迁移数据...');

  try {
    // 1. 创建管理员账户
    console.log('创建管理员账户...');
    const adminPassword = '123456';
    const hashedPassword = await hashPassword(adminPassword);

    // 尝试创建管理员用户
    const { data: adminUser, error: userError } = await supabase
      .from('users')
      .insert([
        {
          username: 'admin',
          password: hashedPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    let adminUserId: string;

    if (userError) {
      // 如果用户已存在（唯一约束错误），获取现有用户
      if (userError.code === '23505' || userError.message.includes('duplicate key value')) {
        console.log('管理员账户已存在，获取现有账户...');
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', 'admin')
          .single();
        
        if (existingUser) {
          adminUserId = existingUser.id;
          console.log('使用现有管理员账户:', adminUserId);
        } else {
          console.error('无法获取管理员用户');
          return;
        }
      } else {
        console.error('创建管理员账户失败:', userError);
        return;
      }
    } else {
      if (adminUser) {
        adminUserId = adminUser.id;
        console.log('管理员账户创建成功:', adminUserId);
      } else {
        console.error('管理员账户创建失败');
        return;
      }
    }

    // 2. 从备份文件加载订单数据
    console.log('加载订单备份数据...');
    const ordersData = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'data', 'orders.json'), 'utf8')
    );

    // 3. 将订单数据插入到数据库并关联到管理员账户
    console.log('迁移订单数据...');
    for (const order of ordersData) {
      // 检查订单是否已存在
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('id', order.id)
        .single();

      if (existingOrder) {
        // 如果订单已存在，更新其用户ID
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            user_id: adminUserId,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);

        if (updateError) {
          console.error(`更新订单 ${order.id} 失败:`, updateError);
        } else {
          console.log(`订单 ${order.id} 已更新关联到管理员账户`);
        }
      } else {
        // 如果订单不存在，插入新订单
        const { error: insertError } = await supabase
          .from('orders')
          .insert([{
            id: order.id,
            content: order.content,
            order_number: order.orderNumber,
            status: order.status,
            amount: order.amount,
            user_id: adminUserId,
            created_at: order.createdAt,
            updated_at: order.updatedAt || new Date().toISOString()
          }]);

        if (insertError) {
          console.error(`插入订单 ${order.id} 失败:`, insertError);
        } else {
          console.log(`订单 ${order.id} 已成功插入并关联到管理员账户`);
        }
      }
    }

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