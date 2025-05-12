import nodemailer from 'nodemailer';

// メール送信用のトランスポーターを作成
// 開発環境ではMailHogを使用
const transporter = nodemailer.createTransport({
  host: process.env.NODE_ENV === 'production' ? 'mailhog' : 'localhost', // Docker環境では'mailhog'、ローカル開発では'localhost'
  port: 1025,      // MailHogのSMTPポート
  secure: false,   // 開発環境では暗号化不要
  ignoreTLS: true, // TLSを無視
});

// 登録完了メールを送信する関数
export async function sendRegistrationEmail(
  to: string,
  firstName: string,
  lastName: string
) {
  try {
    // メールの内容を設定
    const mailOptions = {
      from: '"ダンスドリル運営チーム" <noreply@dancedrill.example.com>',
      to,
      subject: '【ダンスドリル】ご登録ありがとうございます',
      text: `${lastName} ${firstName} 様

ダンスドリルへのご登録ありがとうございます。

アカウントが正常に作成されました。
登録メールアドレス: ${to}

以下のURLからログインして、サービスをご利用いただけます。

https://dancedrill.example.com/login

ご不明な点がございましたら、お気軽にお問い合わせください。

------------------------------
ダンスドリル運営チーム
support@dancedrill.example.com
https://dancedrill.example.com
------------------------------`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    .container {
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 5px;
    }
    .header {
      background-color: #4a6cf7;
      color: white;
      padding: 15px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
    }
    .button {
      display: inline-block;
      background-color: #4a6cf7;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #eee;
      padding-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ダンスドリル</h1>
    </div>
    <div class="content">
      <p>${lastName} ${firstName} 様</p>
      
      <p>ダンスドリルへのご登録ありがとうございます。</p>
      
      <p>アカウントが正常に作成されました。<br>
      登録メールアドレス: ${to}<br>
      以下のボタンからログインして、サービスをご利用いただけます。</p>
      
      <a href="https://dancedrill.example.com/login" class="button">ログインする</a>
      
      <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
    </div>
    <div class="footer">
      <p>
        ダンスドリル運営チーム<br>
        support@dancedrill.example.com<br>
        https://dancedrill.example.com
      </p>
    </div>
  </div>
</body>
</html>
      `,
    };

    // メールを送信
    const info = await transporter.sendMail(mailOptions);
    console.log('メール送信成功:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('メール送信エラー:', error);
    return { success: false, error };
  }
}

// パスワードリセットメールを送信する関数
export async function sendPasswordResetEmail(
  to: string,
  resetToken: string
) {
  try {
    // リセットURLを生成（実際の環境に合わせて調整してください）
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    // メールの内容を設定
    const mailOptions = {
      from: '"ダンスドリル運営チーム" <noreply@dancedrill.example.com>',
      to,
      subject: '【ダンスドリル】パスワードリセットのご案内',
      text: `
パスワードリセットのリクエストを受け付けました。

以下のリンクをクリックして、新しいパスワードを設定してください。
${resetUrl}

このリンクは24時間有効です。

このリクエストに心当たりがない場合は、このメールを無視してください。

------------------------------
ダンスドリル運営チーム
support@dancedrill.example.com
https://dancedrill.example.com
------------------------------`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    .container {
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 5px;
    }
    .header {
      background-color: #4a6cf7;
      color: white;
      padding: 15px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
    }
    .button {
      display: inline-block;
      background-color: #4a6cf7;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #777;
      border-top: 1px solid #eee;
      padding-top: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ダンスドリル</h1>
    </div>
    <div class="content">
      <p>パスワードリセットのリクエストを受け付けました。</p>
      
      <p>以下のボタンをクリックして、新しいパスワードを設定してください。</p>
      
      <a href="${resetUrl}" class="button">パスワードをリセット</a>
      
      <p>このリンクは24時間有効です。</p>
      
      <p>このリクエストに心当たりがない場合は、このメールを無視してください。</p>
    </div>
    <div class="footer">
      <p>
        ダンスドリル運営チーム<br>
        support@dancedrill.example.com<br>
        https://dancedrill.example.com
      </p>
    </div>
  </div>
</body>
</html>
      `,
    };

    // メールを送信
    const info = await transporter.sendMail(mailOptions);
    console.log('パスワードリセットメール送信成功:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('パスワードリセットメール送信エラー:', error);
    return { success: false, error };
  }
}

// メールトランスポーターが正常に動作しているか確認する関数
export async function verifyMailTransport() {
  try {
    await transporter.verify();
    console.log('メールサーバーに接続できました');
    return true;
  } catch (error) {
    console.error('メールサーバー接続エラー:', error);
    return false;
  }
}
