import { NextRequest, NextResponse } from 'next/server';
import { sendRegistrationInviteEmail } from '@/lib/mail';
import { checkEmailExists } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディからメールアドレスを取得
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'メールアドレスが必要です' },
        { status: 400 }
      );
    }

    // メールアドレスの形式を検証
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    // メールアドレスが既に登録されているか確認
    const emailCheck = await checkEmailExists(email);
    if (emailCheck.exists) {
      return NextResponse.json(
        { success: false, error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      );
    }

    // 登録用URLを生成
    const registrationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/register?email=${encodeURIComponent(email)}`;

    // 登録案内メールを送信
    await sendRegistrationInviteEmail(email, registrationUrl);

    // 成功レスポンスを返す
    return NextResponse.json(
      { success: true, message: '登録案内メールを送信しました' },
      { status: 200 }
    );
  } catch (error) {
    console.error('登録メール送信エラー:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
