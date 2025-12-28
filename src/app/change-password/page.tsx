'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToDashboardChangePassword() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到仪表盘下的修改密码页面
    router.push('/dashboard/change-password');
  }, [router]);

  return null; // 不渲染任何内容，因为会立即重定向
}