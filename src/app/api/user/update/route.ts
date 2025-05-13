import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

// Prismaクライアントのインスタンスを作成
const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
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
    
    // リクエストボディからユーザー情報を取得
    const userData = await request.json();
    
    // 更新するフィールドを定義
    const updateData = {
      lastName: userData.lastName,
      firstName: userData.firstName,
      lastNameKana: userData.lastNameKana,
      firstNameKana: userData.firstNameKana,
      lastNameRomaji: userData.lastNameRomaji,
      firstNameRomaji: userData.firstNameRomaji,
      gender: userData.gender,
      postalCode: userData.postalCode,
      address: userData.address,
      building: userData.building || null,
      birthDate: new Date(userData.birthDate),
      phone: userData.phone,
      photoUrl: userData.photoUrl || null,
      receiveNews: userData.receiveNews || false,
    };
    
    // ユーザー情報を更新
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
    
    // 成功レスポンスを返す
    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('ユーザー情報更新エラー:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
