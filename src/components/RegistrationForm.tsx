'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  registrationSchema, 
  RegistrationFormValues,
  userTypeOptions,
  genderOptions,
  affiliationOptions
} from '@/lib/schema';
import { getAddressByPostalCode } from '@/lib/postal-api';

// フォームの状態を管理する型
type FormStep = 'input' | 'confirm' | 'complete';

// コンポーネントのプロパティ型
interface RegistrationFormProps {
  defaultEmail?: string;
}

export default function RegistrationForm({ defaultEmail = '' }: RegistrationFormProps) {
  // フォームのステップ状態
  const [formStep, setFormStep] = useState<FormStep>('input');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showParentalConsent, setShowParentalConsent] = useState(false);
  const [showSchoolName, setShowSchoolName] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  const { 
    register, 
    handleSubmit,
    setValue,
    watch,
    formState: { errors } 
  } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      receiveNews: false,
      parentalConsent: false,
      email: defaultEmail
    }
  });

  // defaultEmailが変更されたときにフォームの値を更新
  useEffect(() => {
    if (defaultEmail) {
      setValue('email', defaultEmail);
    }
  }, [defaultEmail, setValue]);

  // ユーザータイプの値を監視して保護者確認の表示を切り替える
  const userType = watch('userType');
  
  // ユーザータイプが変更されたときに実行される
  useEffect(() => {
    console.log('User type changed:', userType);
    setShowParentalConsent(userType === 'student');
    setShowSchoolName(userType === 'alumni');
  }, [userType]);

  // 確認画面へ進む
  const goToConfirmStep = async () => {
    // メールアドレスの重複チェック
    try {
      const response = await fetch('/api/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: watch('email') }),
      });
      
      const result = await response.json();
      
      if (result.success && result.exists) {
        // メールアドレスが既に登録されている場合
        setEmailError('このメールアドレスは既に登録されています');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      // エラーがなければ確認画面へ
      setEmailError(null);
      setFormStep('confirm');
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('メールアドレスチェックエラー:', error);
      setEmailError('メールアドレスの確認中にエラーが発生しました');
    }
  };


  // 入力画面に戻る
  const goBackToInputStep = () => {
    setFormStep('input');
    window.scrollTo(0, 0);
  };

  // フォーム送信処理
  const onSubmit = async (data: RegistrationFormValues) => {
    if (formStep === 'input') {
      // エラーをリセット
      setEmailError(null);
      
      // 入力画面から確認画面へ
      goToConfirmStep();
      return;
    }

    // 利用規約に同意していない場合は送信しない
    if (!termsAgreed) {
      alert('利用規約に同意してください');
      return;
    }

    setIsSubmitting(true);
    try {
    // APIにデータを送信
    const response = await fetch('/api/register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 送信成功時の処理
        setSubmitSuccess(true);
        setFormStep('complete');
      } else {
        // エラーメッセージを設定
        if (result.error.includes('メールアドレス')) {
          setEmailError(result.error);
          goBackToInputStep(); // 入力画面に戻る
        } else {
          alert(`登録エラー: ${result.error}`);
        }
        console.error('登録エラー:', result.error);
      }
    } catch (error) {
      console.error('送信エラー:', error);
      alert('送信中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostalCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const postalCode = e.target.value;
    
    // 郵便番号が7桁の場合のみAPIを呼び出す
    if (postalCode.replace(/-/g, '').length === 7) {
      const addressData = await getAddressByPostalCode(postalCode);
      if (addressData) {
        const fullAddress = `${addressData.prefecture}${addressData.city}${addressData.address}`;
        setValue('address', fullAddress);
      }
    }
  };

  // 利用規約のダミーテキスト
  const termsText = `
  【利用規約】

  第1条（適用範囲）
  本規約は、当サービスの利用に関する条件を定めるものです。ユーザーは本規約に同意の上、当サービスを利用するものとします。

  第2条（ユーザー登録）
  1. ユーザーは、真実かつ正確な情報を提供して登録するものとします。
  2. 虚偽の情報を提供した場合、当サービスの利用を停止することがあります。

  第3条（個人情報の取り扱い）
  1. 当サービスは、プライバシーポリシーに従って個人情報を適切に管理します。
  2. 収集した個人情報は、サービス提供の目的以外には使用しません。

  第4条（禁止事項）
  以下の行為を禁止します。
  - 法令違反行為
  - 他のユーザーへの迷惑行為
  - システムに負荷をかける行為
  - その他、当サービスが不適切と判断する行為

  第5条（サービスの変更・中断）
  当サービスは、予告なくサービス内容の変更や一時中断を行うことがあります。

  第6条（免責事項）
  当サービスの利用によって生じたいかなる損害についても、当サービスは責任を負いません。

  第7条（規約の変更）
  当サービスは、必要に応じて本規約を変更することがあります。変更後の規約は、当サイトに掲載した時点で効力を生じるものとします。

  以上
  `;

  // 完了画面
  if (submitSuccess && formStep === 'complete') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-green-600 mb-4">登録が完了しました</h2>
        <p className="mb-4">ご登録いただきありがとうございます。</p>
        <p className="mb-6">入力いただいたメールアドレスに確認メールを送信しました。</p>
        
        <div className="flex justify-center">
          <Link 
            href="/"
            className="inline-flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ログインへ
          </Link>
        </div>
      </div>
    );
  }

  // 確認画面
  if (formStep === 'confirm') {
    const formValues = watch();
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">入力内容の確認</h1>
        <p className="mb-6 text-gray-600">以下の内容をご確認ください。</p>
        
        <div className="space-y-6 mb-8">
          {/* ユーザータイプ */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-500">ユーザータイプ</h3>
            <p className="mt-1">
              {userTypeOptions.find(option => option.id === formValues.userType)?.label || ''}
            </p>
          </div>
          
          {/* 氏名 */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-500">氏名</h3>
            <p className="mt-1">{formValues.lastName} {formValues.firstName}</p>
            <p className="mt-1 text-sm text-gray-500">
              {formValues.lastNameKana} {formValues.firstNameKana}（フリガナ）
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {formValues.lastNameRomaji} {formValues.firstNameRomaji}（ローマ字）
            </p>
          </div>
          
          {/* 性別 */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-500">性別</h3>
            <p className="mt-1">
              {genderOptions.find(option => option.id === formValues.gender)?.label || ''}
            </p>
          </div>
          
          {/* 住所 */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-500">住所</h3>
            <p className="mt-1">〒{formValues.postalCode}</p>
            <p className="mt-1">{formValues.address}</p>
            {formValues.building && <p className="mt-1">{formValues.building}</p>}
          </div>
          
          {/* 生年月日 */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-500">生年月日</h3>
            <p className="mt-1">{formValues.birthDate}</p>
          </div>
          
          {/* 電話番号 */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-500">電話番号</h3>
            <p className="mt-1">{formValues.phone}</p>
          </div>
          
          {/* 学校名（表示されている場合のみ） */}
          {formValues.schoolName && (
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500">所属していた学校名</h3>
              <p className="mt-1">{formValues.schoolName}</p>
            </div>
          )}
          
          {/* 所属（表示されている場合のみ） */}
          {formValues.affiliation && (
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500">所属</h3>
              <p className="mt-1">
                {affiliationOptions.find(option => option.id === formValues.affiliation)?.label || ''}
              </p>
              {formValues.affiliationDetail && (
                <p className="mt-1 text-sm text-gray-500">{formValues.affiliationDetail}</p>
              )}
            </div>
          )}
          
          {/* 顔写真 */}
          {previewImage && (
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500">顔写真</h3>
              <div className="mt-2 relative w-32 h-32 overflow-hidden rounded-md border border-gray-300">
                <Image 
                  src={previewImage} 
                  alt="プレビュー" 
                  className="object-cover"
                  fill
                  sizes="128px"
                />
              </div>
            </div>
          )}
          
          {/* メールアドレス */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-500">メールアドレス</h3>
            <p className="mt-1">{formValues.email}</p>
          </div>
          
          {/* ニュース受取 */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-500">ニュース受取</h3>
            <p className="mt-1">{formValues.receiveNews ? '受け取る' : '受け取らない'}</p>
          </div>
        </div>
        
        {/* 利用規約 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">利用規約</h3>
          <div className="bg-gray-50 p-4 rounded-md h-48 overflow-y-auto mb-4 text-sm">
            <pre className="whitespace-pre-wrap font-sans">{termsText}</pre>
          </div>
          <div className="flex items-start mb-6">
            <div className="flex items-center h-5">
              <input
                id="terms-agreement"
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms-agreement" className="font-medium text-gray-700">
                利用規約に同意する <span className="text-red-500">*</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* ボタン */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={goBackToInputStep}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            入力画面に戻る
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || !termsAgreed}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isSubmitting ? '送信中...' : '登録する'}
          </button>
        </div>
      </div>
    );
  }

  // 入力画面
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">ユーザー登録</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ユーザータイプ選択 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            ユーザータイプ <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-4">
            {userTypeOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={option.id}
                  {...register('userType', {
                    onChange: (e) => {
                      console.log('User type changed:', e.target.value);
                      setShowParentalConsent(e.target.value === 'student');
                      setShowSchoolName(e.target.value === 'alumni');
                    }
                  })}
                  className="h-4 w-4 text-blue-600"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {errors.userType && (
            <p className="text-red-500 text-sm mt-1">{errors.userType.message}</p>
          )}
        </div>

        {/* 保護者確認 */}
        {showParentalConsent && (
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="parentalConsent"
                type="checkbox"
                {...register('parentalConsent')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="parentalConsent" className="font-medium text-gray-700">
                保護者確認（必須） <span className="text-red-500">*</span>
              </label>
              <p className="text-gray-500 text-xs">※18歳未満の方は保護者の確認を得てください</p>
              {errors.parentalConsent && (
                <p className="text-red-500 text-sm mt-1">{errors.parentalConsent.message}</p>
              )}
            </div>
          </div>
        )}

        {/* 氏名 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium">
              姓 <span className="text-red-500">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              {...register('lastName')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium">
              名 <span className="text-red-500">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              {...register('firstName')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
            )}
          </div>
        </div>

        {/* フリガナ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lastNameKana" className="block text-sm font-medium">
              姓（フリガナ） <span className="text-red-500">*</span>
            </label>
            <input
              id="lastNameKana"
              type="text"
              {...register('lastNameKana')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.lastNameKana && (
              <p className="text-red-500 text-sm mt-1">{errors.lastNameKana.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="firstNameKana" className="block text-sm font-medium">
              名（フリガナ） <span className="text-red-500">*</span>
            </label>
            <input
              id="firstNameKana"
              type="text"
              {...register('firstNameKana')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.firstNameKana && (
              <p className="text-red-500 text-sm mt-1">{errors.firstNameKana.message}</p>
            )}
          </div>
        </div>

        {/* ローマ字表記 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lastNameRomaji" className="block text-sm font-medium">
              姓（ローマ字） <span className="text-red-500">*</span>
            </label>
            <input
              id="lastNameRomaji"
              type="text"
              {...register('lastNameRomaji')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.lastNameRomaji && (
              <p className="text-red-500 text-sm mt-1">{errors.lastNameRomaji.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="firstNameRomaji" className="block text-sm font-medium">
              名（ローマ字） <span className="text-red-500">*</span>
            </label>
            <input
              id="firstNameRomaji"
              type="text"
              {...register('firstNameRomaji')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.firstNameRomaji && (
              <p className="text-red-500 text-sm mt-1">{errors.firstNameRomaji.message}</p>
            )}
          </div>
        </div>

        {/* 性別 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            性別 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-4">
            {genderOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={option.id}
                  {...register('gender')}
                  className="h-4 w-4 text-blue-600"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {errors.gender && (
            <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
          )}
        </div>

        {/* 郵便番号・住所 */}
        <div className="space-y-4">
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium">
              郵便番号 <span className="text-red-500">*</span>
            </label>
            <input
              id="postalCode"
              type="text"
              placeholder="例: 123-4567"
              {...register('postalCode')}
              onChange={handlePostalCodeChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.postalCode && (
              <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">郵便番号を入力すると住所が自動入力されます</p>
          </div>


          <div>
            <label htmlFor="address" className="block text-sm font-medium">
              住所 <span className="text-red-500">*</span>
            </label>
            <input
              id="address"
              type="text"
              {...register('address')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="building" className="block text-sm font-medium">
              建物名・部屋番号
            </label>
            <input
              id="building"
              type="text"
              {...register('building')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 生年月日 */}
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium">
            生年月日 <span className="text-red-500">*</span>
          </label>
          <input
            id="birthDate"
            type="date"
            max="9999-12-31"
            {...register('birthDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.birthDate && (
            <p className="text-red-500 text-sm mt-1">{errors.birthDate.message}</p>
          )}
        </div>

        {/* 電話番号 */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            電話番号 <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="例: 090-1234-5678"
            {...register('phone')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* 所属していた学校名 */}
        {showSchoolName && (
          <div>
            <label htmlFor="schoolName" className="block text-sm font-medium">
              所属していた学校名 <span className="text-red-500">*</span>
            </label>
            <input
              id="schoolName"
              type="text"
              {...register('schoolName', { required: '所属していた学校名を入力してください' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.schoolName && (
              <p className="text-red-500 text-sm mt-1">{errors.schoolName.message}</p>
            )}
          </div>
        )}

        {/* 所属 */}
        {showSchoolName && (
          <div className="mt-4">
            <label className="block text-sm font-medium">
              所属 <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex flex-wrap gap-4">
              {affiliationOptions.map((option) => (
                <label key={option.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    value={option.id}
                    {...register('affiliation', { required: '所属を選択してください' })}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {errors.affiliation && (
              <p className="text-red-500 text-sm mt-1">{errors.affiliation.message}</p>
            )}
          </div>
        )}

        {/* 詳細 */}
        {showSchoolName && (
          <div className="mt-4">
            <label htmlFor="affiliationDetail" className="block text-sm font-medium">
              詳細（任意）
            </label>
            <input
              id="affiliationDetail"
              type="text"
              {...register('affiliationDetail')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="所属に関する詳細情報があれば入力してください"
            />
          </div>
        )}

        {/* 顔写真登録 */}
        <div>
          <label className="block text-sm font-medium">
            顔写真登録
          </label>
          <div className="mt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => document.getElementById('photo-upload')?.click()}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              ファイルを使用
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              撮影する
            </button>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // ファイルをプレビュー表示
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setPreviewImage(reader.result as string);
                    // 実際のアプリケーションでは、ファイルをサーバーにアップロードし、
                    // 返されたURLをphotoUrlフィールドに設定する
                    setValue('photoUrl', file.name); // 仮の実装
                  };
                  reader.readAsDataURL(file);
                  console.log('Selected file:', file);
                }
              }}
            />
          </div>
          {previewImage && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">プレビュー</p>
              <div className="relative w-32 h-32 overflow-hidden rounded-md border border-gray-300">
                <Image 
                  src={previewImage || ''} 
                  alt="プレビュー" 
                  className="object-cover"
                  fill
                  sizes="128px"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
                  onClick={() => {
                    setPreviewImage(null);
                    setValue('photoUrl', '');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-1">顔写真を登録してください</p>
        </div>

        {/* メールアドレス */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`mt-1 block w-full rounded-md ${emailError ? 'border-red-500' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>
          <div>
            <label htmlFor="emailConfirm" className="block text-sm font-medium">
              メールアドレス（確認用） <span className="text-red-500">*</span>
            </label>
            <input
              id="emailConfirm"
              type="email"
              {...register('emailConfirm')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.emailConfirm && (
              <p className="text-red-500 text-sm mt-1">{errors.emailConfirm.message}</p>
            )}
          </div>
        </div>

        {/* パスワード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              パスワード <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">8文字以上で入力してください</p>
          </div>
          <div>
            <label htmlFor="passwordConfirm" className="block text-sm font-medium">
              パスワード（確認用） <span className="text-red-500">*</span>
            </label>
            <input
              id="passwordConfirm"
              type="password"
              {...register('passwordConfirm')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.passwordConfirm && (
              <p className="text-red-500 text-sm mt-1">{errors.passwordConfirm.message}</p>
            )}
          </div>
        </div>

        {/* ニュース受取 */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="receiveNews"
              type="checkbox"
              {...register('receiveNews')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="receiveNews" className="font-medium text-gray-700">
              ニュースやお知らせを受け取る
            </label>
            <p className="text-gray-500">最新情報をメールでお届けします</p>
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => {
              // フォームのバリデーションを手動で実行
              handleSubmit(onSubmit)();
            }}
            disabled={isSubmitting}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            入力内容を確認する
          </button>
        </div>
      </form>
    </div>
  );
}
