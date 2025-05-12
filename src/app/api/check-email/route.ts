import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'メールアドレスが指定されていません' },
        { status: 400 }
      );
    }
    
    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    
    return NextResponse.json({
      success: true,
      exists: !!existingUser,
      message: existingUser ? 'このメールアドレスは既に登録されています' : '利用可能なメールアドレスです',
    });
  } catch (error) {
    console.error('メールアドレスチェックエラー:', error);
    return NextResponse.json(
      { success: false, error: '内部サーバーエラー' },
      { status: 500 }
    );
  }
}
