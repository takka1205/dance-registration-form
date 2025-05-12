import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    const result = await initializeDatabase();
    
    if (result.success) {
      return NextResponse.json(
        { success: true, message: 'データベースが正常に初期化されました' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'データベース初期化に失敗しました' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('データベース初期化エラー:', error);
    return NextResponse.json(
      { success: false, error: '内部サーバーエラー' },
      { status: 500 }
    );
  }
}
