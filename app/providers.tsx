'use client';

import { TelegramProvider } from '@telegram-apps/sdk-react';
import { PropsWithChildren, useEffect } from 'react';

export function Providers({ children }: PropsWithChildren) {
  useEffect(() => {
    // Initialize Telegram SDK
    const { init } = require('@telegram-apps/sdk-react');
    init();
  }, []);

  return (
    <TelegramProvider>
      {children}
    </TelegramProvider>
  );
}