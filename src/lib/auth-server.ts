import { SignJWT, jwtVerify } from 'jose';
import { compare, hash } from 'bcryptjs';
import { cookies } from 'next/headers';
import { User } from './user';
import { NextResponse } from 'next/server';

// JWT密钥，实际应用中应从环境变量获取
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here_must_be_at_least_32_chars_long';
  if (secret === 'your_jwt_secret_key_here_must_be_at_least_32_chars_long') {
    console.warn('警告: 使用默认JWT密钥，生产环境中请设置JWT_SECRET环境变量');
  }
  return new TextEncoder().encode(secret);
};

const JWT_SECRET = getJWTSecret();

// 密码加密
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await hash(password, saltRounds);
}

// 密码验证
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}

// 生成JWT token
export async function signToken(payload: { userId: string; username: string }): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60 * 24 * 30; // 30天过期

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(JWT_SECRET);
}

// 验证JWT token
export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// 获取当前登录用户
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return null;
    }

    return payload as { userId: string; username: string };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// 用于API路由的设置认证cookie函数
export function setAuthCookieForResponse(token: string): NextResponse {
  const response = NextResponse.json({ message: 'Success' });
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: 60 * 60 * 24 * 30, // 30天
    path: '/',
    sameSite: 'strict',
  });
  return response;
}

// 用于API路由的清除认证cookie函数
export function clearAuthCookieForResponse(): NextResponse {
  const response = NextResponse.json({ message: 'Success' });
  response.cookies.delete('token');
  return response;
}

// 服务器组件中直接操作cookie的函数（使用headers模块）
export async function setAuthCookieDirect(token: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      maxAge: 60 * 60 * 24 * 30, // 30天
      path: '/',
      sameSite: 'strict',
    });
  } catch (error) {
    console.error('Error setting auth cookie:', error);
  }
}

// 服务器组件中直接清除cookie的函数
export async function clearAuthCookieDirect() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');
  } catch (error) {
    console.error('Error clearing auth cookie:', error);
  }
}