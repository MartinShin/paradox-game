import './globals.css';

export const metadata = {
  title: '선택의 역설 - 알레와 엘즈버그',
  description: '알레의 역설과 엘즈버그의 역설을 직접 체험해보는 의사결정 게임',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
