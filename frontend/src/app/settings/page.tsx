'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootSettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/settings');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#080B11] flex items-center justify-center text-slate-400 text-xs font-mono">
      Redirecting to System Settings...
    </div>
  );
}
