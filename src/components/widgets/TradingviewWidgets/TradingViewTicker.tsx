'use client';

import { useEffect, useRef, memo } from 'react';

function TradingViewTicker() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const currentContainer = container.current;
    currentContainer.innerHTML = '';

    // Use TradingView's modern module widget for the ticker tape
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js';
    script.async = true;

    // Create the custom element that the module defines
    const tape = document.createElement('tv-ticker-tape');
    tape.setAttribute('symbols', 'FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FOREXCOM:DJI,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,CMCMARKETS:GOLD,BSE:SENSEX,TVC:USOIL,CRYPTOCAP:TOTAL');
    tape.setAttribute('hide-chart', '');
    tape.setAttribute('item-size', 'compact');
    tape.setAttribute('show-hover', '');

    // Append script then element (widget will initialize the custom element)
    currentContainer.appendChild(script);
    currentContainer.appendChild(tape);

    return () => {
      currentContainer.innerHTML = '';
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center overflow-x-auto" ref={container} />
  );
}

export default memo(TradingViewTicker);
