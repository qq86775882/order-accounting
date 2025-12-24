'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { verifyPassword, hashPassword } from '@/lib/auth';
import { getCurrentUser as getCurrentUserInfo } from '@/lib/api';
import Notification from '@/components/Notification';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const router = useRouter();

  const handleNotificationClose = () => {
    setNotification(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // 验证密码
    if (newPassword !== confirmNewPassword) {
      setError('新密码与确认密码不一致');
      setNotification({ message: '新密码与确认密码不一致', type: 'error' });
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('新密码长度至少为6位');
      setNotification({ message: '新密码长度至少为6位', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      // 获取当前用户信息
      const user = await getCurrentUserInfo();
      if (!user) {
        setError('未登录或登录已过期');
        setNotification({ message: '未登录或登录已过期', type: 'error' });
        router.push('/login');
        setLoading(false);
        return;
      }

      // 从Supabase获取用户信息（包含密码）
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('id, password')
        .eq('id', user.id)
        .single();

      if (fetchError || !userData) {
        setError('获取用户信息失败');
        setNotification({ message: '获取用户信息失败', type: 'error' });
        setLoading(false);
        return;
      }

      // 验证当前密码
      const isCurrentPasswordValid = await verifyPassword(currentPassword, userData.password);
      if (!isCurrentPasswordValid) {
        setError('当前密码错误');
        setNotification({ message: '当前密码错误', type: 'error' });
        setLoading(false);
        return;
      }

      // 加密新密码
      const hashedNewPassword = await hashPassword(newPassword);

      // 更新数据库中的密码
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password: hashedNewPassword,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        setError('更新密码失败');
        setNotification({ message: '更新密码失败', type: 'error' });
        setLoading(false);
        return;
      }

      setSuccess('密码修改成功！');
      setNotification({ message: '密码修改成功！', type: 'success' });
      
      // 清空表单
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      console.error('修改密码失败:', err);
      setError(err.message || '修改密码失败，请重试');
      setNotification({ message: err.message || '修改密码失败，请重试', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={handleNotificationClose} 
        />
      )}
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            修改密码
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            请填写当前密码和新密码
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                当前密码
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="输入当前密码"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                新密码
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="输入新密码"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                确认新密码
              </label>
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="确认新密码"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
            >
              {loading ? '修改中...' : '修改密码'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}