'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { logoutUser } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 在移动端关闭菜单（路由变化时）
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: '仪表盘', path: '/' },
    { name: '订单管理', path: '/orders' },
    { name: '修改密码', path: '/change-password' }, // 新增修改密码选项
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      // 登出后跳转到登录页
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('登出失败:', error);
      // 即使登出API失败，也跳转到登录页
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <>
      {/* 移动端汉堡菜单按钮 */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="sr-only">打开菜单</span>
          {isMobileMenuOpen ? (
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* 侧边栏 */}
      <div 
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-blue-700 to-indigo-800 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative md:h-screen`}
      >
        <div className="flex items-center justify-center h-16 border-b border-blue-500">
          <span className="text-xl font-bold text-white">订单系统</span>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                    pathname === item.path
                      ? 'bg-white/20 text-white'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* 登出按钮 */}
          <div className="mt-8 pt-6 border-t border-blue-500">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg text-base font-medium text-red-200 hover:bg-red-600/30 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出登录
            </button>
          </div>
        </nav>
      </div>

      {/* 移动端遮罩 */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}
    </>
  );
}