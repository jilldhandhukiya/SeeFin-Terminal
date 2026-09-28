import { create } from 'zustand';
import { simulatedMarketFeed } from '@/utils/simulatedMarketFeed';
import type {
  CoinDcxInstrument,
  CoinDcxOrderBook,
  CoinDcxTrade,
  SmartApiLtpQuote,
  SmartApiScrip,
} from '@/types/market';
import { tradeStorage } from '@/utils/tradeStorage';
import type { PaperOrderType, PaperTradeRecord, PaperTradeSide, PaperTradeStatus } from '@/types/trade';

type TradeDraft = {
  venue: 'SMARTAPI' | 'COINDCX';
  coinProduct: 'spot' | 'futures';
  exchange: string;
  search: string;
  side: PaperTradeSide;
  orderType: PaperOrderType;
  quantity: string;
  limitPrice: string;
};

type PaperTradeStore = {
  draft: TradeDraft;
  searchResults: SmartApiScrip[];
  coinResults: CoinDcxInstrument[];
  selected: SmartApiScrip | null;
  selectedCoin: CoinDcxInstrument | null;
  quote: SmartApiLtpQuote | null;
  coinOrderBook: CoinDcxOrderBook | null;
  coinTrades: CoinDcxTrade[];
  smartApiDetails: unknown[];
  trades: PaperTradeRecord[];
  loadingSearch: boolean;
  loadingQuote: boolean;
  executing: boolean;
  error: string;
  message: string;
  setDraft: (patch: Partial<TradeDraft>) => void;
  selectScrip: (scrip: SmartApiScrip) => Promise<void>;
  searchScrips: () => Promise<void>;
  refreshQuote: () => Promise<void>;
  executeTrade: () => Promise<void>;
  activateTrade: (id: string) => Promise<void>;
  cancelTrade: (id: string) => void;
  closeTrade: (id: string) => Promise<void>;
  clearError: () => void;
};

const SEARCH_TTL_MS = 5 * 60_000;
const quoteNumber = (value: string | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed / 100 : 0;
};

const nowIso = () => new Date().toISOString();

const initialDraft: TradeDraft = {
  venue: 'SMARTAPI',
  coinProduct: 'futures',
  exchange: 'NSE',
  search: 'SBIN',
  side: 'BUY',
  orderType: 'MARKET',
  quantity: '1',
  limitPrice: '',
};

const normalizeScrip = (item: SmartApiScrip): SmartApiScrip => ({
  exchange: String(item.exchange ?? '').toUpperCase(),
  tradingsymbol: String(item.tradingsymbol ?? '').toUpperCase(),
  symboltoken: String(item.symboltoken ?? ''),
});

const smartApiToken = (scrip: SmartApiScrip) => `${scrip.exchange}:${scrip.symboltoken}`;
const coinToken = (instrument: CoinDcxInstrument) => `${instrument.product}:${instrument.pair}`;

const persistTrades = (trades: PaperTradeRecord[]) => {
  tradeStorage.saveTrades(trades);
  return trades;
};

const tradePnl = (trade: PaperTradeRecord): number => {
  if (!trade.entryPrice || !trade.lastPrice) return 0;
  const direction = trade.side === 'BUY' ? 1 : -1;
  return (trade.lastPrice - trade.entryPrice) * trade.quantity * direction;
};

export const usePaperTradeStore = create<PaperTradeStore>((set, get) => ({
  draft: initialDraft,
  searchResults: [],
  coinResults: [],
  selected: null,
  selectedCoin: null,
  quote: null,
  coinOrderBook: null,
  coinTrades: [],
  smartApiDetails: [],
  trades: tradeStorage.loadTrades(),
  loadingSearch: false,
  loadingQuote: false,
  executing: false,
  error: '',
  message: '',
  clearError: () => set({ error: '', message: '' }),
  setDraft: (patch) => set((state) => ({
    draft: { ...state.draft, ...patch },
    error: '',
    message: '',
  })),
  searchScrips: async () => {
    const { draft } = get();
    const search = draft.search.trim().toUpperCase();
    const exchange = draft.exchange.trim().toUpperCase();
    if (!search) {
      set({ error: 'Enter a symbol to search.' });
      return;
    }

    const cacheKey = `${draft.venue}:${draft.venue === 'COINDCX' ? draft.coinProduct : exchange}:${search}`;
    const cached = tradeStorage.getSearch<SmartApiScrip[] | CoinDcxInstrument[]>(cacheKey);
    if (cached) {
      if (draft.venue === 'COINDCX') {
        const coinResults = cached as CoinDcxInstrument[];
        set({ coinResults, selectedCoin: coinResults[0] ?? null, error: '', message: 'Loaded from search cache.' });
        if (coinResults[0]) await get().selectScrip({ exchange: 'COINDCX', tradingsymbol: coinResults[0].symbol, symboltoken: coinResults[0].pair });
      } else {
        const smartResults = cached as SmartApiScrip[];
        set({ searchResults: smartResults, selected: smartResults[0] ?? null, error: '', message: 'Loaded from search cache.' });
        if (smartResults[0]) await get().selectScrip(smartResults[0]);
      }
      return;
    }

    set({ loadingSearch: true, error: '', message: '' });
    try {
      if (draft.venue === 'COINDCX') {
        const results = await simulatedMarketFeed.searchCrypto(search, draft.coinProduct);
        tradeStorage.setSearch(cacheKey, results, SEARCH_TTL_MS);
        set({
          loadingSearch: false,
          coinResults: results,
          searchResults: [],
          selectedCoin: results[0] ?? null,
          selected: null,
          message: `${results.length} simulated CoinDCX instruments loaded.`,
        });
        if (results[0]) await get().refreshQuote();
        return;
      }

      const results = (await simulatedMarketFeed.searchScrips(exchange, search)).map(normalizeScrip);
      tradeStorage.setSearch(cacheKey, results, SEARCH_TTL_MS);
      set({
        loadingSearch: false,
        searchResults: results,
        coinResults: [],
        selected: results.find((item) => item.tradingsymbol.endsWith('-EQ')) ?? results[0] ?? null,
        selectedCoin: null,
        message: `${results.length} instruments loaded.`,
      });
      if (get().selected) await get().refreshQuote();
    } catch (error) {
      set({
        loadingSearch: false,
        error: error instanceof Error ? error.message : 'Unable to search scrips.',
      });
    }
  },
  selectScrip: async (scrip) => {
    const currentCoin = get().coinResults.find((item) => item.pair === scrip.symboltoken);
    if (currentCoin) {
      set({ selectedCoin: currentCoin, selected: null, quote: null, coinOrderBook: null, coinTrades: [], error: '', message: '' });
    } else {
      set({ selected: normalizeScrip(scrip), selectedCoin: null, quote: null, error: '', message: '' });
    }
    await get().refreshQuote();
  },
  refreshQuote: async () => {
    const { selected, selectedCoin, draft } = get();
    if (!selected && !selectedCoin) {
      set({ error: 'Select an instrument before requesting LTP.' });
      return;
    }

    set({ loadingQuote: true, error: '' });
    try {
      if (draft.venue === 'COINDCX' && selectedCoin) {
        const [instrument, orderBook, trades] = await Promise.all([
          simulatedMarketFeed.refreshCryptoInstrument(selectedCoin),
          simulatedMarketFeed.getCryptoOrderBook(selectedCoin),
          simulatedMarketFeed.getCryptoTrades(selectedCoin),
        ]);
        const ltp = instrument.lastPrice;
        const token = coinToken(instrument);
        const openTrades = get().trades.map((trade) => (
          trade.exchange === 'COINDCX' && trade.symboltoken === token && ['OPEN', 'ACTIVE'].includes(trade.status)
            ? { ...trade, lastPrice: ltp || trade.lastPrice, updatedAt: nowIso() }
            : trade
        ));
        set({
          loadingQuote: false,
          selectedCoin: instrument,
          coinOrderBook: orderBook,
          coinTrades: trades,
          trades: persistTrades(openTrades),
          message: 'Price refreshed.',
        });
        return;
      }

      if (!selected) return;
      const quote = await simulatedMarketFeed.getLtpData(selected);
      const ltp = quoteNumber(quote?.ltp);
      const trades = get().trades.map((trade) => (
        trade.exchange !== 'COINDCX' && trade.symboltoken === smartApiToken(selected) && ['OPEN', 'ACTIVE'].includes(trade.status)
          ? { ...trade, lastPrice: ltp || trade.lastPrice, updatedAt: nowIso() }
          : trade
      ));
      set({
        loadingQuote: false,
        quote,
        smartApiDetails: [
          {
            tradeVolume: Math.floor(1500000 + Math.random() * 800000),
            totalBuyQuantity: 450000,
            totalSellQuantity: 420000,
            lowerCircuit: Math.round(ltp * 0.9 * 100) / 100,
            upperCircuit: Math.round(ltp * 1.1 * 100) / 100,
          },
        ],
        trades: persistTrades(trades),
        message: 'LTP refreshed.',
      });
    } catch (error) {
      set({
        loadingQuote: false,
        error: error instanceof Error ? error.message : 'Unable to fetch LTP data.',
      });
    }
  },
  executeTrade: async () => {
    const { draft, selected, selectedCoin } = get();
    if (!selected && !selectedCoin) {
      set({ error: 'Select an instrument before executing a paper trade.' });
      return;
    }
    const quantity = Number(draft.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      set({ error: 'Quantity must be greater than zero.' });
      return;
    }

    set({ executing: true, error: '', message: '' });
    await get().refreshQuote();
    const refreshed = get();
    const ltp = refreshed.draft.venue === 'COINDCX'
      ? refreshed.selectedCoin?.lastPrice ?? 0
      : quoteNumber(refreshed.quote?.ltp);
    const limitPrice = draft.orderType === 'LIMIT' ? Number(draft.limitPrice) : null;
    if (!ltp) {
      set({ executing: false, error: 'Cannot execute without a valid LTP.' });
      return;
    }
    if (draft.orderType === 'LIMIT' && (!limitPrice || limitPrice <= 0)) {
      set({ executing: false, error: 'Limit price must be greater than zero.' });
      return;
    }

    const marketable = draft.orderType === 'MARKET'
      || (draft.side === 'BUY' && Number(limitPrice) >= ltp)
      || (draft.side === 'SELL' && Number(limitPrice) <= ltp);
    const timestamp = nowIso();
    const coinInstrument = refreshed.selectedCoin;
    const isCoin = draft.venue === 'COINDCX' && coinInstrument;
    const exchange = isCoin ? 'COINDCX' : String(selected?.exchange);
    const tradingsymbol = isCoin ? coinInstrument.symbol : String(selected?.tradingsymbol);
    const symboltoken = isCoin ? coinToken(coinInstrument) : smartApiToken(selected as SmartApiScrip);
    const trade: PaperTradeRecord = {
      id: `PT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      exchange,
      tradingsymbol,
      symboltoken,
      side: draft.side,
      orderType: draft.orderType,
      quantity,
      limitPrice,
      entryPrice: marketable ? ltp : null,
      exitPrice: null,
      lastPrice: ltp,
      status: marketable ? 'ACTIVE' : 'OPEN',
      rejectReason: '',
      createdAt: timestamp,
      updatedAt: timestamp,
      closedAt: '',
    };

    set((state) => ({
      executing: false,
      trades: persistTrades([trade, ...state.trades]),
      message: marketable ? 'Paper trade executed.' : 'Limit order queued.',
    }));
  },
  activateTrade: async (id) => {
    await get().refreshQuote();
    const quote = get().quote;
    const ltp = quoteNumber(quote?.ltp);
    const timestamp = nowIso();
    set((state) => ({
      trades: persistTrades(state.trades.map((trade) => {
        if (trade.id !== id || trade.status !== 'OPEN') return trade;
        return {
          ...trade,
          status: 'ACTIVE' as PaperTradeStatus,
          entryPrice: ltp || trade.limitPrice,
          lastPrice: ltp || trade.lastPrice,
          updatedAt: timestamp,
        };
      })),
      message: 'Limit order activated.',
    }));
  },
  cancelTrade: (id) => {
    const timestamp = nowIso();
    set((state) => ({
      trades: persistTrades(state.trades.map((trade) => (
        trade.id === id && trade.status === 'OPEN'
          ? { ...trade, status: 'CANCELLED', rejectReason: 'Cancelled by user', updatedAt: timestamp, closedAt: timestamp }
          : trade
      ))),
      message: 'Open order cancelled.',
    }));
  },
  closeTrade: async (id) => {
    await get().refreshQuote();
    const quote = get().quote;
    const ltp = quoteNumber(quote?.ltp);
    const timestamp = nowIso();
    set((state) => ({
      trades: persistTrades(state.trades.map((trade) => (
        trade.id === id && trade.status === 'ACTIVE'
          ? { ...trade, status: 'CLOSED', exitPrice: ltp || trade.lastPrice, lastPrice: ltp || trade.lastPrice, updatedAt: timestamp, closedAt: timestamp }
          : trade
      ))),
      message: 'Trade closed at latest LTP.',
    }));
  },
}));

export const getPaperTradePnl = tradePnl;
