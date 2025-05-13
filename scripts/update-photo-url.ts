import { PrismaClient } from '../src/generated/prisma';

// Prismaクライアントのインスタンスを作成
const prisma = new PrismaClient();

async function updatePhotoUrl() {
  try {
    // ユーザーのメールアドレスを指定
    const userEmail = 'taka1928taka_7@icloud.com';
    
    // 画像のパスを指定
    const photoUrl = '/uploads/images.jpeg';
    
    // ユーザーデータを更新
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { photoUrl },
    });
    
    console.log('ユーザーの顔写真を更新しました:', updatedUser);
  } catch (error) {
    console.error('エラー:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプトを実行
updatePhotoUrl();
