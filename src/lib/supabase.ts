import { createClient } from '@supabase/supabase-js'

// Supabase配置
const supabaseUrl = 'https://ctndcrqyiwxuixdslryv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0bmRjcnF5aXd4dWl4ZHNscnl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMjIzMjEsImV4cCI6MjA4MTY5ODMyMX0.xzW-uXwEg9TDzYKp2Jl2pY2sVoy9SPM_CyVM-BmiqQ8'

// 创建Supabase客户端实例
export const supabase = createClient(supabaseUrl, supabaseKey)

// 订单类型定义
export interface Order {
  id: string
  content: string
  order_number: string
  status: '已下单' | '已完成' | '已结算'
  amount: number
  user_id: string  // 新增：关联用户ID
  created_at: string
  updated_at: string
}