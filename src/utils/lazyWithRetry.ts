import React from 'react';

export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return React.lazy(async () => {
    const pageHasBeenRefreshed = window.sessionStorage.getItem('page-has-been-refreshed') === 'true';

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasBeenRefreshed) {
        window.sessionStorage.setItem('page-has-been-refreshed', 'true');
        window.location.reload();
        return new Promise<{ default: T }>(() => {}); // Keep pending until reload
      }
      throw error;
    }
  });
}
