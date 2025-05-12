import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/db';
import { registrationSchema } from '@/lib/schema';
import { sendRegistrationEmail, verifyMailTransport } from '@/lib/mail';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json();
    
    // バリデーション
    try {
      registrationSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'バリデーションエラー', details: error.errors },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'バリデーションエラー' },
        { status: 400 }
      );
    }
    
    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    // ユーザーデータの準備
    const userData = {
      ...body,
      password: hashedPassword,
    };
    
    // メールサーバーの接続確認
    await verifyMailTransport();
    
    // ユーザー登録
    const result = await registerUser(userData);
    
    if (result.success) {
      // 登録完了メールを送信
      try {
        await sendRegistrationEmail(
          body.email,
          body.firstName,
          body.lastName
        );
        console.log('登録完了メールを送信しました:', body.email);
      } catch (emailError) {
        console.error('メール送信エラー:', emailError);
        // メール送信に失敗してもユーザー登録自体は成功とする
      }
      
      return NextResponse.json(
        { success: true, message: 'ユーザーが正常に登録されました', userId: result.userId },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'ユーザー登録に失敗しました' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('登録エラー:', error);
    return NextResponse.json(
      { success: false, error: '内部サーバーエラー' },
      { status: 500 }
    );
  }
}
