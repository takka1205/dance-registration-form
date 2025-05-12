import axios from 'axios';

interface PostalResponse {
  results?: {
    zipcode: string;
    prefcode: string;
    address1: string; // 都道府県
    address2: string; // 市区町村
    address3: string; // 町域
    kana1: string;
    kana2: string;
    kana3: string;
  }[];
  status: number;
}

export async function getAddressByPostalCode(postalCode: string): Promise<{
  prefecture: string;
  city: string;
  address: string;
} | null> {
  try {
    // 郵便番号からハイフンを削除
    const cleanedPostalCode = postalCode.replace(/-/g, '');
    
    // 郵便番号検索APIを呼び出す
    const response = await axios.get<PostalResponse>(
      `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanedPostalCode}`
    );
    
    if (response.data.status === 200 && response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        prefecture: result.address1,
        city: result.address2,
        address: result.address3,
      };
    }
    
    return null;
  } catch (error) {
    console.error('郵便番号検索に失敗しました:', error);
    return null;
  }
}
