'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // ここに実際のパスワードリセットリクエスト処理を実装します
      // 例: APIエンドポイントにリクエストを送信
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // 成功した場合、送信完了画面を表示
        setIsSubmitted(true);
      } else {
        // エラーメッセージを表示
        setError(data.error || 'パスワードリセットリクエストに失敗しました。');
      }
    } catch (err) {
      console.error('パスワードリセットエラー:', err);
      setError('サーバーとの通信中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 送信完了画面
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h2 className="mt-2 text-lg font-medium text-gray-900">
                パスワードリセットメールを送信しました
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {email} 宛にパスワードリセット用のリンクを送信しました。
                メールをご確認いただき、リンクをクリックしてパスワードをリセットしてください。
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  ログイン画面に戻る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // パスワードリセットリクエストフォーム
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">
            パスワードをリセット
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            登録時のメールアドレスを入力してください。
            パスワードリセット用のリンクをメールで送信します。
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                メールアドレス
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isSubmitting ? '送信中...' : 'リセットリンクを送信'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              ログイン画面に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
