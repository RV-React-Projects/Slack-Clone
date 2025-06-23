'use client';

import { ReactNode } from 'react';
import { Provider as StoreProvider } from 'react-redux';
import { ThemeProvider } from 'next-themes';
import { useAppTheme } from '@redux/hooks';
import { store } from '@redux/store';

interface ProvidersProps {
  children: ReactNode;
}

export function ThemeWrapper({ children }: ProvidersProps) {
  const { theme } = useAppTheme();

  return <div className={`${theme}`}>{children}</div>;
}

export default function AppProviders({ children }: ProvidersProps) {
  return (
    <StoreProvider store={store}>
      <ThemeWrapper>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </ThemeWrapper>
    </StoreProvider>
  );
}
