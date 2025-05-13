'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ユーザー情報の型定義
interface UserInfo {
  id: number;
  userType: string;
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  lastNameRomaji: string;
  firstNameRomaji: string;
  gender: string;
  postalCode: string;
  address: string;
  building?: string;
  affiliation?: string;
  affiliationDetail?: string;
  schoolName?: string;
  birthDate: string;
  phone: string;
  photoUrl?: string;
  email: string;
  receiveNews: boolean;
  parentalConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

// ユーザータイプのオプション
const userTypeOptions = [
  { id: 'student', label: '学生' },
  { id: 'alumni', label: '顧問・コーチ' },
  { id: 'og_ob', label: 'OG/OB' },
  { id: 'staff', label: 'スタッフ' },
];

// 性別のオプション
const genderOptions = [
  { id: 'male', label: '男性' },
  { id: 'female', label: '女性' },
  { id: 'other', label: 'その他' },
];

export default function AccountPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserInfo>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

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
          setFormData(data.user);
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

  // フォームの入力値が変更されたときの処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  // フォームの送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // APIエンドポイントにユーザー情報を送信
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'ユーザー情報の更新に失敗しました');
      }
      
      if (data.success && data.user) {
        setUser(data.user);
        setIsEditing(false);
        setSaveSuccess(true);
        
        // 3秒後に成功メッセージを非表示にする
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        throw new Error('ユーザー情報の更新に失敗しました');
      }
    } catch (err) {
      console.error('ユーザー情報更新エラー:', err);
      setError('ユーザー情報の更新に失敗しました');
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

  // 編集モード
  if (isEditing && user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">アカウント情報の編集</h1>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData(user);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                キャンセル
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本情報 */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h2 className="text-lg font-medium mb-4">基本情報</h2>
                
                {/* 顔写真 */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32 overflow-hidden rounded-md border border-gray-300">
                    <img 
                      src={user.photoUrl || '/uploads/images.jpeg'} 
                      alt="プロフィール写真" 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        // 画像の読み込みに失敗した場合、代替画像を表示
                        e.currentTarget.src = '/uploads/images.jpeg';
                      }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">姓</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">名</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastNameKana" className="block text-sm font-medium text-gray-700">姓（フリガナ）</label>
                    <input
                      type="text"
                      id="lastNameKana"
                      name="lastNameKana"
                      value={formData.lastNameKana || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="firstNameKana" className="block text-sm font-medium text-gray-700">名（フリガナ）</label>
                    <input
                      type="text"
                      id="firstNameKana"
                      name="firstNameKana"
                      value={formData.firstNameKana || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastNameRomaji" className="block text-sm font-medium text-gray-700">姓（ローマ字）</label>
                    <input
                      type="text"
                      id="lastNameRomaji"
                      name="lastNameRomaji"
                      value={formData.lastNameRomaji || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="firstNameRomaji" className="block text-sm font-medium text-gray-700">名（ローマ字）</label>
                    <input
                      type="text"
                      id="firstNameRomaji"
                      name="firstNameRomaji"
                      value={formData.firstNameRomaji || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">性別</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="">選択してください</option>
                      {genderOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">生年月日</label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* 連絡先情報 */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h2 className="text-lg font-medium mb-4">連絡先情報</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">メールアドレス</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">電話番号</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">郵便番号</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">住所</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="building" className="block text-sm font-medium text-gray-700">建物名・部屋番号</label>
                    <input
                      type="text"
                      id="building"
                      name="building"
                      value={formData.building || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* 設定 */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h2 className="text-lg font-medium mb-4">設定</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        id="receiveNews"
                        name="receiveNews"
                        checked={formData.receiveNews || false}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="receiveNews" className="font-medium text-gray-700">ニュースやお知らせを受け取る</label>
                      <p className="text-gray-500">最新情報をメールでお届けします</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 送信ボタン */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {loading ? '保存中...' : '変更を保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 表示モード
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">アカウント情報</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  編集
                </button>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ダッシュボードに戻る
                </Link>
              </div>
            </div>

          {saveSuccess && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">変更が保存されました</p>
                </div>
              </div>
            </div>
          )}

          {user && (
            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h2 className="text-lg font-medium mb-4">基本情報</h2>
                
                {/* 顔写真 */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32 overflow-hidden rounded-md border border-gray-300">
                    <img 
                      src={user.photoUrl || '/uploads/images.jpeg'} 
                      alt="プロフィール写真" 
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        // 画像の読み込みに失敗した場合、代替画像を表示
                        e.currentTarget.src = '/uploads/images.jpeg';
                      }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ユーザータイプ</p>
                    <p className="mt-1">
                      {userTypeOptions.find(option => option.id === user.userType)?.label || user.userType}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">氏名</p>
                    <p className="mt-1">{user.lastName} {user.firstName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">フリガナ</p>
                    <p className="mt-1">{user.lastNameKana} {user.firstNameKana}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">ローマ字</p>
                    <p className="mt-1">{user.lastNameRomaji} {user.firstNameRomaji}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">性別</p>
                    <p className="mt-1">
                      {genderOptions.find(option => option.id === user.gender)?.label || user.gender}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">生年月日</p>
                    <p className="mt-1">{new Date(user.birthDate).toLocaleDateString('ja-JP')}</p>
                  </div>
                </div>
              </div>
              
              {/* 連絡先情報 */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h2 className="text-lg font-medium mb-4">連絡先情報</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">メールアドレス</p>
                    <p className="mt-1">{user.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">電話番号</p>
                    <p className="mt-1">{user.phone}</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">住所</p>
                    <p className="mt-1">〒{user.postalCode}</p>
                    <p className="mt-1">{user.address}</p>
                    {user.building && <p className="mt-1">{user.building}</p>}
                  </div>
                </div>
              </div>
              
              {/* 設定 */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h2 className="text-lg font-medium mb-4">設定</h2>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">ニュース配信</p>
                  <p className="mt-1">{user.receiveNews ? '受け取る' : '受け取らない'}</p>
                </div>
              </div>
              
              {/* アカウント情報 */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h2 className="text-lg font-medium mb-4">アカウント情報</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">登録日</p>
                    <p className="mt-1">{new Date(user.createdAt).toLocaleDateString('ja-JP')}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">最終更新日</p>
                    <p className="mt-1">{new Date(user.updatedAt).toLocaleDateString('ja-JP')}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link
                    href="/reset-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    パスワードを変更する
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
