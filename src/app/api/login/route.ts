import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディからメールアドレスとパスワードを取得
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'メールアドレスとパスワードが必要です' },
        { status: 400 }
      );
    }

    // ユーザー認証
    const authResult = await authenticateUser(email, password);

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error },
        { status: 401 }
      );
    }

    // 認証成功時の処理
    // 実際のアプリケーションでは、ここでセッショントークンやJWTを生成し、
    // Cookieに保存するなどの処理を行います

    // デモ用に簡易的なセッションCookieを設定
    const response = NextResponse.json(
      { 
        success: true, 
        message: 'ログインに成功しました',
        user: authResult.user
      },
      { status: 200 }
    );

    // Cookieを設定
    response.cookies.set('user_session', JSON.stringify(authResult.user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24時間
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('ログインエラー:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
