import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/mail';
import { verifyMailTransport } from '@/lib/mail';

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

    // メールサーバーの接続を確認
    const mailServerOk = await verifyMailTransport();
    if (!mailServerOk) {
      return NextResponse.json(
        { success: false, error: 'メールサーバーに接続できません' },
        { status: 500 }
      );
    }

    // パスワードリセットトークンを生成
    const tokenResult = await createPasswordResetToken(email);

    if (!tokenResult.success || !tokenResult.resetToken) {
      // ユーザーが見つからない場合でも、セキュリティ上の理由から成功レスポンスを返す
      // これにより、攻撃者がメールアドレスの存在を確認できないようにする
      return NextResponse.json(
        { success: true, message: 'パスワードリセットメールを送信しました（存在する場合）' },
        { status: 200 }
      );
    }

    // パスワードリセットメールを送信
    const emailResult = await sendPasswordResetEmail(
      email,
      tokenResult.resetToken
    );

    if (!emailResult.success) {
      console.error('パスワードリセットメール送信エラー:', emailResult.error);
      return NextResponse.json(
        { success: false, error: 'メール送信中にエラーが発生しました' },
        { status: 500 }
      );
    }

    // 成功レスポンスを返す
    return NextResponse.json(
      { success: true, message: 'パスワードリセットメールを送信しました' },
      { status: 200 }
    );
  } catch (error) {
    console.error('パスワードリセットエラー:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
