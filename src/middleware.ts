import { NextRequest, NextResponse } from 'next/server';

// 保護されたルート（ログインが必要なページ）
const protectedRoutes = ['/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ユーザーセッションの確認
  const userSession = request.cookies.get('user_session');
  
  // ログイン済みのユーザーがトップページにアクセスした場合、/dashboardにリダイレクト
  if (pathname === '/' && userSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // 保護されたルートへのアクセスで、ログインしていない場合
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !userSession) {
    // ログインページにリダイレクト
    const url = new URL('/', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// ミドルウェアを適用するパス
export const config = {
  matcher: [
    /*
     * 以下のパスにマッチ:
     * - / (トップページ)
     * - /dashboard で始まるすべてのパス
     */
    '/',
    '/dashboard/:path*',
  ],
};
