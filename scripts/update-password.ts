import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

// Prismaクライアントのインスタンスを作成
const prisma = new PrismaClient();

async function main() {
  try {
    // 更新するユーザーのメールアドレス
    const email = 'taka1928taka_2@icloud.com';
    
    // 新しいパスワード
    const newPassword = 'takahiro1205';
    
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // ユーザーが存在するか確認
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!existingUser) {
      console.log('ユーザーが見つかりません:', email);
      return;
    }
    
    // ユーザーのパスワードを更新
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    
    console.log('パスワードが更新されました。ユーザーID:', updatedUser.id);
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    // Prismaクライアントを切断
    await prisma.$disconnect();
  }
}

main();
