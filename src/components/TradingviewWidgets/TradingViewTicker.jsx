import React, { useEffect, useRef, memo } from 'react';

function TradingViewTicker() {
  const container = useRef();

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        {
          proName: 'BITSTAMP:BTCUSD',
          title: 'Bitcoin'
        },
        {
          proName: 'BITSTAMP:ETHUSD',
          title: 'Ethereum'
        },
        {
          proName: 'CRYPTOCAP:TOTAL',
          title: 'MARKETCAP'
        },
        {
          proName: 'FX_IDC:USDINR',
          title: 'US/IN'
        },
        {
          proName: 'NASDAQ:IXIC',
          title: 'NASDAQ'
        },
        {
          proName: 'BSE:SENSEX',
          title: 'SENSEX'
        }
      ],
      colorTheme: 'dark',
      locale: 'en',
      largeChartUrl: '',
      isTransparent: true,
      showSymbolLogo: true,
      displayMode: 'adaptive'
    });

    container.current.appendChild(script);

    // Store reference to container in variable for cleanup
    const currentContainer = container.current;

    return () => {
      if (currentContainer && script.parentNode === currentContainer) {
        currentContainer.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center">
      <div className="tradingview-widget-container w-full" ref={container}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
}

export default memo(TradingViewTicker);