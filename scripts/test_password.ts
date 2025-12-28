import { compare } from 'bcryptjs';

async function testPassword() {
  const password = '123456';
  // 使用从数据库中获取的新哈希值
  const storedHash = '$2a$12$.tI.8qel.3WAyTTy0b7FfObGY0D8H5C4gzcLWrGqiSk/zi21qujGi'; // 从数据库获取的哈希
  
  console.log('Testing password:', password);
  console.log('Stored hash:', storedHash);
  
  const isValid = await compare(password, storedHash);
  console.log('Password match:', isValid);
  
  // 尝试一个错误的密码
  const wrongPassword = 'wrongpassword';
  const isWrongValid = await compare(wrongPassword, storedHash);
  console.log('Wrong password match:', isWrongValid);
}

testPassword();