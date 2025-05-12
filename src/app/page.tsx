'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';

// SearchParamsを使用するコンポーネントを分離
import SearchParamsHandler from './SearchParamsHandler';

export default function Home() {
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');
  const router = useRouter();

  // リダイレクトパスを設定する関数
  const handleRedirectPath = (path: string) => {
    setRedirectPath(path);
  };

  // 新規登録メール送信処理
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setIsRegisterLoading(true);

    try {
      // APIエンドポイントにリクエストを送信
      const response = await fetch('/api/send-registration-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: registerEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        // 送信成功時の処理
        console.log('登録メール送信成功:', data);
        setRegisterSuccess(data.message || '登録案内メールを送信しました。メールをご確認ください。');
        setRegisterEmail(''); // 入力欄をクリア
      } else {
        // エラーメッセージを表示
        setRegisterError(data.error || '登録メールの送信に失敗しました');
      }
    } catch (err) {
      console.error('登録メール送信エラー:', err);
      setRegisterError('サーバーとの通信中にエラーが発生しました');
    } finally {
      setIsRegisterLoading(false);
    }
  };

  // ログイン処理
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoginLoading(true);

    try {
      // APIエンドポイントにリクエストを送信
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginEmail, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // ログイン成功時の処理
        console.log('ログイン成功:', data);
        
        // リダイレクト先が指定されている場合はそこに、そうでなければダッシュボードにリダイレクト
        router.push(redirectPath || '/dashboard');
      } else {
        // エラーメッセージを表示
        setLoginError(data.error || 'ログインに失敗しました');
      }
    } catch (err) {
      console.error('ログインエラー:', err);
      setLoginError('サーバーとの通信中にエラーが発生しました');
    } finally {
      setIsLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* SearchParamsHandlerをSuspenseでラップ */}
      <Suspense fallback={<div>Loading...</div>}>
        <SearchParamsHandler onRedirectPathChange={handleRedirectPath} />
      </Suspense>
      
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
        {/* 左側：新規登録フォーム */}
        <div className="lg:w-1/2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-center text-4xl font-extrabold text-blue-600 mb-8">
              新しいダンスドリルが、ここから始まる。
            </h1>
            <p className="text-lg font-semibold text-gray-800 mb-4">大会情報がすぐ届く！ 登録メールで最新情報を見逃さない</p>
            <ul className="space-y-3 text-gray-700 mb-6">
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>エントリーがオンラインで完結！ 書類提出もラクラク</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>チーム管理もカンタンに！ 団体ごとの登録情報を一元化</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>決済もオンラインOK！ 支払いの手間を大幅カット</span>
              </li>
              <li className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>オリジナルグッズも購入可能！ 会員限定の特典も予定！</span>
              </li>
            </ul>

            {/* 新規登録フォーム */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-center text-xl font-bold text-gray-900 mb-4">
                新規登録はこちら
              </h3>
              
              {registerSuccess && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{registerSuccess}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {registerError && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{registerError}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleRegisterSubmit}>
                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
                    メールアドレス
                  </label>
                  <div className="mt-1">
                    <input
                      id="register-email"
                      name="register-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="メールアドレスを入力してください"
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={isRegisterLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                  >
                    {isRegisterLoading ? '送信中...' : '登録案内メールを送信'}
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  登録案内メールを送信します。メールに記載されたリンクから登録を完了してください。
                </p>
              </form>
            </div>
          </div>
        </div>
        
        {/* 右側：ログインフォーム */}
        <div className="lg:w-1/2">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <h2 className="text-center text-2xl font-bold text-gray-900 mb-6">
              アカウントにログイン
            </h2>
            
            {loginError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{loginError}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
                  メールアドレス
                </label>
                <div className="mt-1">
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  パスワード
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    ログイン状態を保持する
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
                    パスワードをお忘れですか？
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {isLoginLoading ? 'ログイン中...' : 'ログイン'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
