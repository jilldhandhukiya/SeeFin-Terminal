import type {
  CoinDcxInstrument,
  CoinDcxOrderBook,
  CoinDcxTrade,
  SmartApiLtpQuote,
  SmartApiScrip,
} from '@/types/market';

type SimulatedStock = {
  exchange: string;
  tradingsymbol: string;
  symboltoken: string;
  name: string;
  basePrice: number;
};

type SimulatedCrypto = {
  symbol: string;
  pair: string;
  product: 'spot' | 'futures';
  basePrice: number;
  volume: number;
};

const STOCKS: SimulatedStock[] = [
  { exchange: 'NSE', tradingsymbol: 'SBIN-EQ', symboltoken: '3045', name: 'STATE BANK OF INDIA', basePrice: 814.50 },
  { exchange: 'NSE', tradingsymbol: 'RELIANCE-EQ', symboltoken: '2885', name: 'RELIANCE INDUSTRIES LTD', basePrice: 2986.20 },
  { exchange: 'NSE', tradingsymbol: 'TCS-EQ', symboltoken: '11536', name: 'TATA CONSULTANCY SERVICES', basePrice: 4215.00 },
  { exchange: 'NSE', tradingsymbol: 'INFY-EQ', symboltoken: '1594', name: 'INFOSYS LIMITED', basePrice: 1892.40 },
  { exchange: 'NSE', tradingsymbol: 'HDFCBANK-EQ', symboltoken: '1333', name: 'HDFC BANK LIMITED', basePrice: 1648.75 },
  { exchange: 'NSE', tradingsymbol: 'TATAMOTORS-EQ', symboltoken: '3456', name: 'TATA MOTORS LIMITED', basePrice: 982.30 },
  { exchange: 'NSE', tradingsymbol: 'ICICIBANK-EQ', symboltoken: '4963', name: 'ICICI BANK LIMITED', basePrice: 1245.60 },
  { exchange: 'NSE', tradingsymbol: 'LT-EQ', symboltoken: '11483', name: 'LARSEN & TOUBRO LTD', basePrice: 3650.00 },
  { exchange: 'NSE', tradingsymbol: 'ITC-EQ', symboltoken: '1660', name: 'ITC LIMITED', basePrice: 495.20 },
  { exchange: 'NSE', tradingsymbol: 'BHARTIARTL-EQ', symboltoken: '10604', name: 'BHARTI AIRTEL LIMITED', basePrice: 1580.40 },
  { exchange: 'NSE', tradingsymbol: 'NIFTY 50', symboltoken: '26000', name: 'NIFTY 50 BENCHMARK', basePrice: 24140.30 },
  { exchange: 'NSE', tradingsymbol: 'BANKNIFTY', symboltoken: '26009', name: 'NIFTY BANK BENCHMARK', basePrice: 51200.45 },
];

const CRYPTO: SimulatedCrypto[] = [
  { symbol: 'BTCUSDT', pair: 'B-BTC_USDT', product: 'futures', basePrice: 95430.00, volume: 18450.2 },
  { symbol: 'ETHUSDT', pair: 'B-ETH_USDT', product: 'futures', basePrice: 3452.80, volume: 45200.8 },
  { symbol: 'SOLUSDT', pair: 'B-SOL_USDT', product: 'futures', basePrice: 146.20, volume: 112500.5 },
  { symbol: 'DOGEUSDT', pair: 'B-DOGE_USDT', product: 'futures', basePrice: 0.385, volume: 890000.0 },
  { symbol: 'BTCUSDT', pair: 'BTCUSDT', product: 'spot', basePrice: 95410.00, volume: 12200.0 },
  { symbol: 'ETHUSDT', pair: 'ETHUSDT', product: 'spot', basePrice: 3450.00, volume: 32400.0 },
  { symbol: 'SOLUSDT', pair: 'SOLUSDT', product: 'spot', basePrice: 145.90, volume: 85000.0 },
];

// Price jitter helper for realistic live market feel
const jitterPrice = (base: number, maxPct = 0.004) => {
  const delta = (Math.random() * 2 - 1) * maxPct;
  const price = base * (1 + delta);
  return Math.round(price * 100) / 100;
};

export const simulatedMarketFeed = {
  async searchScrips(exchange: string, query: string): Promise<SmartApiScrip[]> {
    const q = query.trim().toUpperCase();
    const matches = STOCKS.filter((s) =>
      s.tradingsymbol.includes(q) || s.name.includes(q) || s.symboltoken === q
    );
    if (matches.length > 0) {
      return matches.map((s) => ({
        exchange: s.exchange,
        tradingsymbol: s.tradingsymbol,
        symboltoken: s.symboltoken,
      }));
    }
    // Fallback dynamic entry if user searches custom ticker
    return [
      {
        exchange: exchange || 'NSE',
        tradingsymbol: `${q}-EQ`,
        symboltoken: String(Math.floor(1000 + Math.random() * 9000)),
      },
    ];
  },

  async getLtpData(scrip: SmartApiScrip): Promise<SmartApiLtpQuote> {
    const stock = STOCKS.find(
      (s) => s.symboltoken === scrip.symboltoken || s.tradingsymbol === scrip.tradingsymbol
    );
    const base = stock?.basePrice ?? 1000.0;
    const ltp = jitterPrice(base);
    const open = Math.round(base * 0.995 * 100) / 100;
    const high = Math.round(Math.max(ltp, base * 1.01) * 100) / 100;
    const low = Math.round(Math.min(ltp, base * 0.99) * 100) / 100;
    const close = Math.round(base * 100) / 100;

    // smartApi quote expects paise format (* 100)
    return {
      exchange: scrip.exchange,
      tradingsymbol: scrip.tradingsymbol,
      symboltoken: scrip.symboltoken,
      open: String(Math.round(open * 100)),
      high: String(Math.round(high * 100)),
      low: String(Math.round(low * 100)),
      close: String(Math.round(close * 100)),
      ltp: String(Math.round(ltp * 100)),
    };
  },

  async searchCrypto(query: string, product: 'spot' | 'futures' = 'futures'): Promise<CoinDcxInstrument[]> {
    const q = query.trim().toUpperCase();
    const filtered = CRYPTO.filter(
      (c) => c.product === product && (c.symbol.includes(q) || c.pair.includes(q))
    );
    const list = filtered.length > 0 ? filtered : CRYPTO.filter((c) => c.product === product);

    return list.map((c) => {
      const lastPrice = jitterPrice(c.basePrice);
      return {
        pair: c.pair,
        symbol: c.symbol,
        product: c.product,
        lastPrice,
        markPrice: lastPrice,
        high: Math.round(c.basePrice * 1.025 * 100) / 100,
        low: Math.round(c.basePrice * 0.975 * 100) / 100,
        volume: c.volume,
        changePercent: Math.round((Math.random() * 6 - 2) * 100) / 100,
      };
    });
  },

  async refreshCryptoInstrument(instrument: CoinDcxInstrument): Promise<CoinDcxInstrument> {
    const lastPrice = jitterPrice(instrument.lastPrice || 100);
    return {
      ...instrument,
      lastPrice,
      markPrice: lastPrice,
    };
  },

  async getCryptoOrderBook(instrument: CoinDcxInstrument): Promise<CoinDcxOrderBook> {
    const mid = instrument.lastPrice || 100;
    const asks: Record<string, string> = {};
    const bids: Record<string, string> = {};

    for (let i = 1; i <= 6; i++) {
      const askPrice = (mid * (1 + 0.0005 * i)).toFixed(2);
      const askQty = (Math.random() * 2 + 0.2).toFixed(3);
      asks[askPrice] = askQty;

      const bidPrice = (mid * (1 - 0.0005 * i)).toFixed(2);
      const bidQty = (Math.random() * 2 + 0.2).toFixed(3);
      bids[bidPrice] = bidQty;
    }

    return {
      ts: Date.now(),
      vs: 1,
      asks,
      bids,
    };
  },

  async getCryptoTrades(instrument: CoinDcxInstrument): Promise<CoinDcxTrade[]> {
    const mid = instrument.lastPrice || 100;
    const trades: CoinDcxTrade[] = [];
    const now = Date.now();

    for (let i = 0; i < 8; i++) {
      const isBuy = Math.random() > 0.5;
      const price = jitterPrice(mid, 0.001);
      const quantity = Math.round((Math.random() * 1.5 + 0.05) * 1000) / 1000;
      trades.push({
        p: price,
        price,
        q: quantity,
        quantity,
        s: isBuy ? 'buy' : 'sell',
        T: now - i * 1400,
        timestamp: now - i * 1400,
        m: !isBuy,
      });
    }

    return trades;
  },
};
