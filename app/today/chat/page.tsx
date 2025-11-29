// 이 페이지는 /today 페이지에서 채팅 모드로 전환되므로
// 리다이렉트하거나 통합된 페이지로 처리할 수 있습니다.
// 현재는 /today 페이지에서 직접 처리하므로 이 파일은 참고용입니다.

import { redirect } from 'next/navigation';

export default function ChatPage() {
  redirect('/today');
}

