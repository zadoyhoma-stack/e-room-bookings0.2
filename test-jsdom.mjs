import { JSDOM } from 'jsdom';

(async () => {
  try {
    const dom = await JSDOM.fromURL('http://localhost:8080/', {
      runScripts: 'dangerously',
      resources: 'usable',
      beforeParse(window) {
        window.console.error = (...args) => {
          console.log('[BROWSER ERROR]', ...args);
        };
        window.console.warn = (...args) => {
          console.log('[BROWSER WARN]', ...args);
        };
        window.onerror = function(message, source, lineno, colno, error) {
          console.log('[BROWSER UNCAUGHT]', message, error);
        };
      }
    });

    // Wait for scripts to load and execute
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('Root HTML:', dom.window.document.getElementById('root')?.innerHTML.substring(0, 500));
  } catch (e) {
    console.error('JSDOM error:', e);
  }
})();
