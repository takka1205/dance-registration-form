import { PrismaClient } from '../generated/prisma';
import { RegistrationFormValues } from './schema';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Prismaクライアントのインスタンスを作成
const prisma = new PrismaClient();

// ユーザー登録用の関数
export async function registerUser(userData: RegistrationFormValues) {
  try {
    // パスワードが既にハッシュ化されているかどうかを確認
    // 注：パスワードが既にハッシュ化されている場合は再度ハッシュ化しない
    // bcryptのハッシュは通常 $2b$ で始まる
    const password = userData.password.startsWith('$2') 
      ? userData.password 
      : await bcrypt.hash(userData.password, 10);
    
    // Prismaを使用してユーザーを作成
    const user = await prisma.user.create({
      data: {
        userType: userData.userType,
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
        email: userData.email,
        password: password, // 適切に処理されたパスワードを保存
        receiveNews: userData.receiveNews || false,
        parentalConsent: userData.parentalConsent || false,
      },
    });
    
    return { success: true, userId: user.id };
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    
    // エラーオブジェクトの詳細をログに出力
    if (error && typeof error === 'object') {
      console.log('エラーコード:', 'code' in error ? error.code : 'なし');
      console.log('エラーメタデータ:', 'meta' in error ? JSON.stringify(error.meta) : 'なし');
    }
    
    // Prismaのエラーコードを確認（P2002はユニーク制約違反）
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return { success: false, error: 'このメールアドレスは既に登録されています' };
    }
    
    return { success: false, error: 'データベースエラーが発生しました' };
  }
}

// メールアドレスの重複チェック関数
export async function checkEmailExists(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    return { success: true, exists: !!user };
  } catch (error) {
    console.error('メールアドレスチェックエラー:', error);
    return { success: false, error };
  }
}

// パスワードリセットトークンを生成する関数
export async function createPasswordResetToken(email: string) {
  try {
    console.log('パスワードリセットトークン生成開始:', email);
    
    // ユーザーが存在するか確認
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    console.log('ユーザー検索結果:', user ? `ID: ${user.id}` : 'ユーザーが見つかりません');
    
    if (!user) {
      return { success: false, error: 'ユーザーが見つかりません' };
    }
    
    // ランダムなトークンを生成
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // トークンのハッシュ化
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // 有効期限を設定（24時間）
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);
    
    console.log('トークン更新前:', { userId: user.id, hashedToken, tokenExpiry });
    
    try {
      // ユーザーのパスワードリセットトークンを更新
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry: tokenExpiry
        },
      });
      
      console.log('トークン更新成功:', updatedUser.id);
    } catch (updateError) {
      console.error('トークン更新エラー:', updateError);
      throw updateError;
    }
    
    // 開発用に、トークンをコンソールに出力
    console.log('パスワードリセットトークン生成:', resetToken);
    console.log('トークン有効期限:', tokenExpiry);
    
    return { success: true, resetToken, userId: user.id };
  } catch (error) {
    console.error('パスワードリセットトークン生成エラー:', error);
    return { success: false, error };
  }
}

// パスワードを更新する関数
export async function updatePassword(token: string, newPassword: string) {
  try {
    // トークンのハッシュ化
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // トークンを持つユーザーを検索
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: {
          gt: new Date() // 現在時刻より後の有効期限を持つトークン
        }
      }
    });
    
    if (!user) {
      return { success: false, error: 'トークンが無効または期限切れです' };
    }
    
    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // ユーザーのパスワードを更新し、トークンをクリア
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('パスワード更新エラー:', error);
    return { success: false, error: 'パスワード更新中にエラーが発生しました' };
  }
}

// ユーザー認証関数
export async function authenticateUser(email: string, password: string) {
  try {
    // ユーザーが存在するか確認
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
    }
    
    // パスワードを検証
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
    }
    
    // ユーザー情報から安全に返せる情報を選択
    const userInfo = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
    };
    
    return { success: true, user: userInfo };
  } catch (error) {
    console.error('ユーザー認証エラー:', error);
    return { success: false, error: 'ログイン処理中にエラーが発生しました' };
  }
}

// データベース初期化関数
export async function initializeDatabase() {
  try {
    // Prismaは自動的にマイグレーションを適用するため、
    // 特別な初期化は必要ありません。
    // ただし、接続テストを行うことができます。
    await prisma.$connect();
    console.log('データベースが初期化されました');
    return { success: true };
  } catch (error) {
    console.error('データベース初期化エラー:', error);
    return { success: false, error: 'データベース初期化中にエラーが発生しました' };
  } finally {
    await prisma.$disconnect();
  }
}
