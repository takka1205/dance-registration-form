import { z } from 'zod';

export const userTypeOptions = [
  { id: 'student', label: '学生' },
  { id: 'advisor', label: '顧問・コーチ' },
  { id: 'alumni', label: 'OG/OB' },
  { id: 'staff', label: 'スタッフ' },
];

export const affiliationOptions = [
  { id: 'university', label: '大学' },
  { id: 'vocational', label: '専門学校' },
  { id: 'employment', label: '就職' },
  { id: 'other', label: 'その他' },
];

export const genderOptions = [
  { id: 'male', label: '男性' },
  { id: 'female', label: '女性' },
  { id: 'other', label: 'その他' },
];

export const registrationSchema = z.object({
  userType: z.string({
    required_error: 'ユーザータイプを選択してください',
  }),
  lastName: z.string().min(1, '姓を入力してください'),
  firstName: z.string().min(1, '名を入力してください'),
  lastNameKana: z.string().min(1, '姓（フリガナ）を入力してください'),
  firstNameKana: z.string().min(1, '名（フリガナ）を入力してください'),
  lastNameRomaji: z.string().min(1, '姓（ローマ字）を入力してください'),
  firstNameRomaji: z.string().min(1, '名（ローマ字）を入力してください'),
  gender: z.string({
    required_error: '性別を選択してください',
  }),
  postalCode: z.string().min(7, '郵便番号は7桁で入力してください').max(8),
  address: z.string().min(1, '住所を入力してください'),
  building: z.string().optional(),
  affiliation: z.string().optional(),
  affiliationDetail: z.string().optional(),
  schoolName: z.string().optional(),
  birthDate: z.string({
    required_error: '生年月日を入力してください',
  }),
  phone: z.string().min(10, '電話番号を正しく入力してください'),
  photoUrl: z.string().optional(),
  email: z.string().email('有効なメールアドレスを入力してください'),
  emailConfirm: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  passwordConfirm: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  receiveNews: z.boolean().optional(),
  parentalConsent: z.boolean().optional(),
}).refine((data) => data.email === data.emailConfirm, {
  message: 'メールアドレスが一致しません',
  path: ['emailConfirm'],
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'パスワードが一致しません',
  path: ['passwordConfirm'],
}).refine((data) => {
  // ユーザータイプが学生の場合、保護者確認が必須
  if (data.userType === 'student') {
    return data.parentalConsent === true;
  }
  return true;
}, {
  message: '保護者確認が必要です',
  path: ['parentalConsent'],
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
