import { NextRequest, NextResponse } from 'next/server';
import { updatePassword } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディからトークンとパスワードを取得
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'トークンとパスワードが必要です' },
        { status: 400 }
      );
    }

    // パスワードの検証
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'パスワードは8文字以上で入力してください' },
        { status: 400 }
      );
    }

    // パスワードを更新
    const result = await updatePassword(token, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'パスワードリセットに失敗しました' },
        { status: 400 }
      );
    }

    // 成功レスポンスを返す
    return NextResponse.json(
      { success: true, message: 'パスワードが正常にリセットされました' },
      { status: 200 }
    );
  } catch (error) {
    console.error('パスワードリセット確認エラー:', error);
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
