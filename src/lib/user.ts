export interface User {
  id: string;
  username: string;
  password: string; // 加密后的密码
  createdAt: string;
  updatedAt: string;
}