const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'takahiro1205';
  // bcryptのソルトラウンドを10に設定（デフォルト値）
  const salt = await bcrypt.genSalt(10);
  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log('Generated salt:', salt);
  console.log('Hashed password:', hashedPassword);
}

generateHash();
