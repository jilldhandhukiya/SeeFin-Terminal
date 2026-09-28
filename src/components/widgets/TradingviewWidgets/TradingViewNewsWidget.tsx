'use client';

import { useEffect, useRef, memo } from 'react';

function TradingViewNewsWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const currentContainer = container.current;
    currentContainer.innerHTML = '';

    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget flex-1 h-full w-full';

    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright';
    copyright.innerHTML =
      '<a href="https://www.tradingview.com/news/top-providers/tradingview/" rel="noopener nofollow" target="_blank"><span class="blue-text">Top stories</span></a><span class="trademark"> by TradingView</span>';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      displayMode: 'regular',
      feedMode: 'all_symbols',
      colorTheme: 'dark',
      isTransparent: false,
      locale: 'en',
      width: '100%',
      height: '100%',
    });

    currentContainer.appendChild(widget);
    currentContainer.appendChild(copyright);
    currentContainer.appendChild(script);

    return () => {
      if (currentContainer.contains(script)) {
        currentContainer.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container h-full w-full flex-1 flex flex-col bg-black min-h-[420px]" ref={container} />
  );
}

export default memo(TradingViewNewsWidget);
