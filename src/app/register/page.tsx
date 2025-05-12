'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import RegistrationForm from '@/components/RegistrationForm';

// SearchParamsを使用するコンポーネントを分離
function RegisterContent() {
  // URLパラメータからメールアドレスを取得
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  return <RegistrationForm defaultEmail={email} />;
}

export default function Register() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Suspense fallback={<div>Loading...</div>}>
          <RegisterContent />
        </Suspense>
      </div>
    </div>
  );
}
