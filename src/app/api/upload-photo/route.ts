import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    // リクエストからフォームデータを取得
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // ファイルが存在しない場合はエラーを返す
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'ファイルが見つかりません' },
        { status: 400 }
      );
    }

    // ファイルの種類を確認
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: '画像ファイルのみアップロードできます' },
        { status: 400 }
      );
    }

    // ファイルサイズを確認（5MBまで）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      );
    }

    // ファイル名を生成（タイムスタンプとランダムな数値を使用）
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    const fileName = `${timestamp}-${randomNum}.${fileExtension}`;
    const filePath = join(process.cwd(), 'public', 'uploads', fileName);

    // ファイルをバイナリデータとして取得
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ファイルを保存
    await writeFile(filePath, buffer);

    // 保存されたファイルのURLを生成
    const fileUrl = `/uploads/${fileName}`;

    // 成功レスポンスを返す
    return NextResponse.json(
      { success: true, url: fileUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    return NextResponse.json(
      { success: false, error: 'ファイルアップロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// アップロードできるファイルサイズの上限を設定
export const config = {
  api: {
    bodyParser: false,
  },
};
