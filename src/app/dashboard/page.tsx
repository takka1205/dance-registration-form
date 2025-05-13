'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ユーザー情報の型定義
interface UserInfo {
  id: number;
  userType: string;
  lastName: string;
  firstName: string;
  email: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ユーザー情報を取得する
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // APIエンドポイントからユーザー情報を取得
        const response = await fetch('/api/user');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'ユーザー情報の取得に失敗しました');
        }
        
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          throw new Error('ユーザー情報が見つかりません');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('ユーザー情報取得エラー:', err);
        setError('ユーザー情報の取得に失敗しました');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // ログアウト処理
  const handleLogout = async () => {
    try {
      setLoading(true);
      
      // APIエンドポイントにログアウトリクエストを送信
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'ログアウトに失敗しました');
      }
      
      // ログアウト成功時の処理
      // ホームページにリダイレクト
      window.location.href = '/';
    } catch (err) {
      console.error('ログアウトエラー:', err);
      setError('ログアウトに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ローディング中の表示
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-center mt-4">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  // エラー時の表示
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center text-red-500">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-xl font-semibold mt-2">{error}</h2>
              <p className="mt-2">ページを再読み込みするか、後でもう一度お試しください。</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                再読み込み
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ダッシュボード表示
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">ダッシュボード</h1>
            <div className="flex space-x-2">
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                ログアウト
              </button>
            </div>
          </div>

          {user && (
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-2">ようこそ、{user.lastName} {user.firstName}さん</h2>
              <p className="text-gray-600">メールアドレス: {user.email}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* アカウント情報カード */}
            <div className="bg-white overflow-hidden shadow border">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">アカウント情報</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">個人情報の確認・編集です</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <Link href="/dashboard/account" className="font-medium text-blue-600 hover:text-blue-500">
                    アカウント情報を見る
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
