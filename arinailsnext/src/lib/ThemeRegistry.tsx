'use client';

import React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { CacheProvider } from '@emotion/react';
import type { EmotionCache } from '@emotion/cache';
import createEmotionCache from './createEmotionCache';

export interface ThemeRegistryProps {
  children: React.ReactNode;
  cache?: EmotionCache;
}

export default function ThemeRegistry({ children, cache }: ThemeRegistryProps) {
  const [{ cache: emotionCache, flush }] = React.useState(() => {
    const cache = createEmotionCache();
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = '';
    for (const name of names) {
      styles += emotionCache.inserted[name];
    }
    return (
      <style
        key={emotionCache.key}
        data-emotion={`${emotionCache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return <CacheProvider value={cache ?? emotionCache}>{children}</CacheProvider>;
}