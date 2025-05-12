import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

// Prismaクライアントのインスタンスを作成
const prisma = new PrismaClient();

async function main() {
  try {
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // ユーザーデータ
    const userData = {
      userType: 'student',
      lastName: '山田',
      firstName: '太郎',
      lastNameKana: 'ヤマダ',
      firstNameKana: 'タロウ',
      lastNameRomaji: 'YAMADA',
      firstNameRomaji: 'TARO',
      gender: 'male',
      postalCode: '123-4567',
      address: '東京都渋谷区渋谷1-1-1',
      building: 'サンプルビル101',
      birthDate: new Date('2000-01-01'),
      phone: '090-1234-5678',
      email: 'taro.yamada@example.com',
      password: hashedPassword,
      receiveNews: true,
      parentalConsent: true,
    };
    
    // ユーザーが既に存在するか確認
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });
    
    if (existingUser) {
      console.log('ユーザーは既に存在します:', existingUser.email);
      return;
    }
    
    // ユーザーを作成
    const user = await prisma.user.create({
      data: userData,
    });
    
    console.log('ユーザーが作成されました:', user);
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    // Prismaクライアントを切断
    await prisma.$disconnect();
  }
}

main();
