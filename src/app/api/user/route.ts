import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

// Prismaクライアントのインスタンスを作成
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Cookieからユーザーセッションを取得
    const userSessionCookie = request.cookies.get('user_session');
    
    if (!userSessionCookie) {
      return NextResponse.json(
        { success: false, error: '認証されていません' },
        { status: 401 }
      );
    }
    
    // ユーザーセッションからユーザーIDを取得
    const userSession = JSON.parse(userSessionCookie.value);
    const userId = userSession.id;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '無効なセッションです' },
        { status: 401 }
      );
    }
    
    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userType: true,
        lastName: true,
        firstName: true,
        lastNameKana: true,
        firstNameKana: true,
        lastNameRomaji: true,
        firstNameRomaji: true,
        gender: true,
        postalCode: true,
        address: true,
        building: true,
        affiliation: true,
        affiliationDetail: true,
        schoolName: true,
        birthDate: true,
        phone: true,
        photoUrl: true,
        email: true,
        receiveNews: true,
        parentalConsent: true,
        createdAt: true,
        updatedAt: true,
        // パスワードは含めない
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }
    
    // 成功レスポンスを返す
    return NextResponse.json(
      { success: true, user },
      { status: 200 }
    );
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
