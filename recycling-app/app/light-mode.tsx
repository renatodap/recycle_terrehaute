'use client';

import { useEffect } from 'react';

export default function LightMode() {
  useEffect(() => {
    // Force light mode on mount
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';

    // Prevent any dark mode changes
    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
      }
      if (document.documentElement.style.colorScheme !== 'light') {
        document.documentElement.style.colorScheme = 'light';
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    return () => observer.disconnect();
  }, []);

  return null;
}