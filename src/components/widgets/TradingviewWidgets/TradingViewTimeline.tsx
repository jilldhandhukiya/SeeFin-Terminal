'use client';

import { useEffect, useRef, memo } from 'react';

function TradingViewTimeline() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const currentContainer = container.current;
    currentContainer.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      feedMode: 'all_symbols',
      isTransparent: false,
      displayMode: 'regular',
      width: '100%',
      height: '100%',
      colorTheme: 'dark',
      locale: 'en',
    });
    
    currentContainer.appendChild(script);

    return () => {
      if (currentContainer && script.parentNode === currentContainer) {
        currentContainer.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container h-full w-full flex-1 flex flex-col bg-black min-h-[420px]" ref={container}>
      <div className="tradingview-widget-container__widget flex-1 h-full w-full" />
    </div>
  );
}

export default memo(TradingViewTimeline);
