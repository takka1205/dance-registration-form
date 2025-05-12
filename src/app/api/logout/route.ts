import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // ログアウト処理
    // セッションCookieを削除する
    const response = NextResponse.json(
      { success: true, message: 'ログアウトしました' },
      { status: 200 }
    );

    // Cookieを削除
    response.cookies.set('user_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // 即時期限切れ
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('ログアウトエラー:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
