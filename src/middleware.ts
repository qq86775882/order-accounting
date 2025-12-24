import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // 定义需要认证的路径
  const protectedPaths = [
    /^\/orders\/?.*/, // 所有订单相关页面
    /^\/api\/orders\/?.*/ // 所有订单相关API
  ];

  // 检查是否为需要认证的路径
  const isProtectedPath = protectedPaths.some(pattern => 
    pattern.test(request.nextUrl.pathname)
  );

  if (isProtectedPath) {
    // 获取token
    const token = request.cookies.get('token')?.value;

    if (!token) {
      // 未认证用户重定向到登录页
      if (request.nextUrl.pathname.startsWith('/orders')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      // API请求返回401
      return new NextResponse(JSON.stringify({ error: '未认证' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 验证token
    const payload = await verifyToken(token);
    if (!payload) {
      // Token无效，清除cookie并重定向
      if (request.nextUrl.pathname.startsWith('/orders')) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }
      
      // API请求返回401
      const response = new NextResponse(JSON.stringify({ error: '认证已过期' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

// 配置中间件应用的路径
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了:
     * - 所有静态文件 (_next/static, _next/image, favicon.ico等)
     * - 登录/注册页面
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|register$).*)',
  ],
};