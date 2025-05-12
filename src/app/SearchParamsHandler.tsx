'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface SearchParamsHandlerProps {
  onRedirectPathChange: (path: string) => void;
}

export default function SearchParamsHandler({ onRedirectPathChange }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams();

  // リダイレクトパラメータを取得
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      onRedirectPathChange(redirect);
    }
  }, [searchParams, onRedirectPathChange]);

  // このコンポーネントは表示要素を持たない
  return null;
}
