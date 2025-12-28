import { hash } from 'bcryptjs';

async function generateHash() {
  const password = '123456';
  const saltRounds = 12;
  
  const hashValue = await hash(password, saltRounds);
  console.log('Password:', password);
  console.log('Hash:', hashValue);
}

generateHash();