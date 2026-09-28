'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import TerminalPanel from '@/components/ui/TerminalPanel';
import TerminalWorkspace from '@/components/layout/TerminalWorkspace';
import TerminalGrid from '@/components/layout/TerminalGrid';
import { formatCurrency, formatCompact } from '@/utils/formatting';
import { ArrowUpRight, BarChart3, ChevronDown, ShieldCheck, TriangleAlert } from 'lucide-react';

type TradeStatus = 'OPEN' | 'ACTIVE' | 'CANCELLED' | 'CLOSED';
type QuoteMetric = 'ltp' | 'changePct';
type UnderlyingKey = 'NIFTY' | 'SENSEX' | 'BANKNIFTY' | 'FINNIFTY' | 'MIDCPNIFTY';

type OptionLeg = {
  ltp: number;
  changePct: number;
  oi: number;
  changeOi: number;
  iv: number;
  volume: number;
  bid: number;
  ask: number;
  greeks: {
    delta: number;
    gamma: number;
    theta: number;
    vega: number;
  };
};

type OptionRow = {
  strike: number;
  ce: OptionLeg;
  pe: OptionLeg;
};

type UnderlyingData = {
  label: string;
  expiry: string;
  spot: number;
  pcr: number;
  ivRank: number;
  maxPain: number;
  support: number;
  resistance: number;
  trend: 'bullish' | 'neutral' | 'bearish';
  range: string;
  chain: OptionRow[];
};

type FnoTrade = {
  id: string;
  contract: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  qty: string;
  entry: number;
  ltp: number;
  pnl: number;
  status: TradeStatus;
};

const UNDERLYINGS: Record<UnderlyingKey, UnderlyingData> = {
  NIFTY: {
    label: 'NIFTY 50',
    expiry: '29 AUG 2026',
    spot: 24775.74,
    pcr: 1.12,
    ivRank: 61,
    maxPain: 24800,
    support: 24650,
    resistance: 24900,
    trend: 'bullish',
    range: '24,700 - 24,900',
    chain: [
      { strike: 24400, ce: { ltp: 398.4, changePct: -18.2, oi: 182300, changeOi: 9200, iv: 13.8, volume: 22400, bid: 398.1, ask: 398.7, greeks: { delta: 0.62, gamma: 0.014, theta: -18.2, vega: 4.4 } }, pe: { ltp: 90.4, changePct: 119.2, oi: 214500, changeOi: 7600, iv: 14.6, volume: 31200, bid: 90.2, ask: 90.6, greeks: { delta: -0.38, gamma: 0.013, theta: -14.1, vega: 4.0 } } },
      { strike: 24500, ce: { ltp: 312.85, changePct: -11.4, oi: 227400, changeOi: 15800, iv: 13.2, volume: 35100, bid: 312.5, ask: 313.1, greeks: { delta: 0.55, gamma: 0.016, theta: -16.8, vega: 4.8 } }, pe: { ltp: 145.7, changePct: 98.6, oi: 188600, changeOi: 5200, iv: 14.1, volume: 27500, bid: 145.4, ask: 146.0, greeks: { delta: -0.45, gamma: 0.015, theta: -15.5, vega: 4.2 } } },
      { strike: 24600, ce: { ltp: 222.2, changePct: -14.8, oi: 169200, changeOi: 8100, iv: 13.1, volume: 21400, bid: 221.9, ask: 222.5, greeks: { delta: 0.47, gamma: 0.015, theta: -15.1, vega: 4.7 } }, pe: { ltp: 214.6, changePct: 84.6, oi: 165500, changeOi: 6000, iv: 14.8, volume: 21900, bid: 214.2, ask: 214.9, greeks: { delta: -0.54, gamma: 0.016, theta: -16.9, vega: 4.5 } } },
      { strike: 24700, ce: { ltp: 158.5, changePct: -9.2, oi: 148800, changeOi: 5400, iv: 12.8, volume: 19800, bid: 158.2, ask: 158.7, greeks: { delta: 0.39, gamma: 0.014, theta: -13.2, vega: 4.1 } }, pe: { ltp: 279.1, changePct: 72.4, oi: 143300, changeOi: 4300, iv: 15.0, volume: 18600, bid: 278.7, ask: 279.3, greeks: { delta: -0.61, gamma: 0.016, theta: -18.2, vega: 4.8 } } },
      { strike: 24800, ce: { ltp: 108.6, changePct: -6.4, oi: 132200, changeOi: 3900, iv: 12.6, volume: 17300, bid: 108.3, ask: 108.8, greeks: { delta: 0.31, gamma: 0.013, theta: -11.9, vega: 3.9 } }, pe: { ltp: 347.8, changePct: 60.2, oi: 121500, changeOi: 3000, iv: 15.1, volume: 16000, bid: 347.4, ask: 348.1, greeks: { delta: -0.69, gamma: 0.017, theta: -19.1, vega: 4.9 } } },
      { strike: 24900, ce: { ltp: 74.8, changePct: -4.2, oi: 104600, changeOi: 2600, iv: 12.4, volume: 14100, bid: 74.6, ask: 75.0, greeks: { delta: 0.24, gamma: 0.012, theta: -10.8, vega: 3.5 } }, pe: { ltp: 429.2, changePct: 55.4, oi: 99700, changeOi: 2200, iv: 15.4, volume: 15100, bid: 428.7, ask: 429.6, greeks: { delta: -0.76, gamma: 0.018, theta: -20.5, vega: 5.0 } } },
    ],
  },
  SENSEX: {
    label: 'SENSEX',
    expiry: '29 AUG 2026',
    spot: 81240.3,
    pcr: 0.98,
    ivRank: 54,
    maxPain: 81200,
    support: 80800,
    resistance: 81800,
    trend: 'neutral',
    range: '80,900 - 81,800',
    chain: [
      { strike: 80600, ce: { ltp: 1014.2, changePct: -12.4, oi: 88200, changeOi: 4200, iv: 11.9, volume: 8900, bid: 1013.5, ask: 1015.0, greeks: { delta: 0.61, gamma: 0.010, theta: -24.2, vega: 6.1 } }, pe: { ltp: 420.5, changePct: 112.3, oi: 91000, changeOi: 5800, iv: 12.7, volume: 12300, bid: 420.1, ask: 420.8, greeks: { delta: -0.39, gamma: 0.010, theta: -20.1, vega: 5.6 } } },
      { strike: 81000, ce: { ltp: 802.8, changePct: -9.7, oi: 94500, changeOi: 6100, iv: 11.8, volume: 10400, bid: 802.1, ask: 803.5, greeks: { delta: 0.54, gamma: 0.011, theta: -21.3, vega: 6.0 } }, pe: { ltp: 568.4, changePct: 98.1, oi: 97000, changeOi: 5400, iv: 12.5, volume: 11200, bid: 568.0, ask: 568.9, greeks: { delta: -0.46, gamma: 0.011, theta: -19.8, vega: 5.8 } } },
      { strike: 81200, ce: { ltp: 681.5, changePct: -8.8, oi: 100200, changeOi: 7000, iv: 11.7, volume: 11700, bid: 681.0, ask: 682.1, greeks: { delta: 0.50, gamma: 0.012, theta: -20.4, vega: 6.2 } }, pe: { ltp: 689.9, changePct: 81.7, oi: 99200, changeOi: 6500, iv: 12.3, volume: 12100, bid: 689.3, ask: 690.4, greeks: { delta: -0.50, gamma: 0.012, theta: -20.0, vega: 6.1 } } },
      { strike: 81400, ce: { ltp: 574.3, changePct: -6.6, oi: 93800, changeOi: 5000, iv: 11.6, volume: 9800, bid: 573.7, ask: 574.8, greeks: { delta: 0.44, gamma: 0.010, theta: -18.5, vega: 5.8 } }, pe: { ltp: 785.7, changePct: 71.4, oi: 90100, changeOi: 4400, iv: 12.2, volume: 10700, bid: 785.2, ask: 786.1, greeks: { delta: -0.56, gamma: 0.011, theta: -21.6, vega: 6.0 } } },
      { strike: 81600, ce: { ltp: 480.6, changePct: -5.4, oi: 84500, changeOi: 3900, iv: 11.5, volume: 8400, bid: 480.1, ask: 481.0, greeks: { delta: 0.37, gamma: 0.009, theta: -16.8, vega: 5.4 } }, pe: { ltp: 894.2, changePct: 62.1, oi: 80200, changeOi: 3000, iv: 12.0, volume: 9600, bid: 893.7, ask: 894.8, greeks: { delta: -0.63, gamma: 0.010, theta: -22.8, vega: 6.2 } } },
    ],
  },
  BANKNIFTY: {
    label: 'BANK NIFTY',
    expiry: '29 AUG 2026',
    spot: 51280.9,
    pcr: 1.05,
    ivRank: 58,
    maxPain: 51300,
    support: 51000,
    resistance: 51600,
    trend: 'bullish',
    range: '51,000 - 51,600',
    chain: [
      { strike: 50800, ce: { ltp: 640.2, changePct: -15.1, oi: 76000, changeOi: 4800, iv: 13.5, volume: 14200, bid: 639.5, ask: 641.0, greeks: { delta: 0.60, gamma: 0.011, theta: -22.5, vega: 5.4 } }, pe: { ltp: 248.5, changePct: 105.4, oi: 81200, changeOi: 5100, iv: 14.2, volume: 15800, bid: 248.1, ask: 249.0, greeks: { delta: -0.40, gamma: 0.011, theta: -18.2, vega: 5.1 } } },
      { strike: 51000, ce: { ltp: 512.4, changePct: -11.8, oi: 84200, changeOi: 6200, iv: 13.3, volume: 18900, bid: 511.8, ask: 513.0, greeks: { delta: 0.54, gamma: 0.012, theta: -21.0, vega: 5.6 } }, pe: { ltp: 334.2, changePct: 92.6, oi: 89400, changeOi: 5800, iv: 14.0, volume: 17400, bid: 333.8, ask: 334.6, greeks: { delta: -0.46, gamma: 0.012, theta: -19.4, vega: 5.4 } } },
      { strike: 51200, ce: { ltp: 402.1, changePct: -9.5, oi: 92400, changeOi: 7400, iv: 13.1, volume: 22100, bid: 401.5, ask: 402.8, greeks: { delta: 0.49, gamma: 0.013, theta: -19.8, vega: 5.8 } }, pe: { ltp: 432.8, changePct: 78.4, oi: 94100, changeOi: 6900, iv: 13.8, volume: 20500, bid: 432.2, ask: 433.4, greeks: { delta: -0.51, gamma: 0.013, theta: -20.2, vega: 5.7 } } },
      { strike: 51400, ce: { ltp: 310.8, changePct: -7.2, oi: 88100, changeOi: 5900, iv: 13.0, volume: 17600, bid: 310.2, ask: 311.4, greeks: { delta: 0.43, gamma: 0.012, theta: -18.2, vega: 5.5 } }, pe: { ltp: 548.6, changePct: 68.2, oi: 86500, changeOi: 4900, iv: 13.7, volume: 16800, bid: 548.0, ask: 549.2, greeks: { delta: -0.57, gamma: 0.012, theta: -21.5, vega: 5.6 } } },
      { strike: 51600, ce: { ltp: 234.5, changePct: -5.6, oi: 79500, changeOi: 4400, iv: 12.8, volume: 15100, bid: 234.0, ask: 235.1, greeks: { delta: 0.36, gamma: 0.011, theta: -16.5, vega: 5.1 } }, pe: { ltp: 678.4, changePct: 59.5, oi: 77800, changeOi: 3800, iv: 13.5, volume: 15300, bid: 677.8, ask: 679.0, greeks: { delta: -0.64, gamma: 0.011, theta: -22.9, vega: 5.8 } } },
    ],
  },
  FINNIFTY: {
    label: 'NIFTY FINANCIAL',
    expiry: '29 AUG 2026',
    spot: 23485.4,
    pcr: 1.02,
    ivRank: 52,
    maxPain: 23500,
    support: 23350,
    resistance: 23600,
    trend: 'neutral',
    range: '23,350 - 23,600',
    chain: [
      { strike: 23300, ce: { ltp: 248.6, changePct: -13.2, oi: 61000, changeOi: 3400, iv: 12.8, volume: 11200, bid: 248.2, ask: 249.0, greeks: { delta: 0.58, gamma: 0.013, theta: -14.2, vega: 4.2 } }, pe: { ltp: 112.4, changePct: 98.4, oi: 64200, changeOi: 3800, iv: 13.4, volume: 12400, bid: 112.1, ask: 112.8, greeks: { delta: -0.42, gamma: 0.013, theta: -12.1, vega: 3.9 } } },
      { strike: 23400, ce: { ltp: 184.2, changePct: -10.4, oi: 68400, changeOi: 4600, iv: 12.6, volume: 14500, bid: 183.8, ask: 184.6, greeks: { delta: 0.52, gamma: 0.014, theta: -13.5, vega: 4.4 } }, pe: { ltp: 156.8, changePct: 86.2, oi: 70100, changeOi: 4200, iv: 13.2, volume: 13900, bid: 156.4, ask: 157.2, greeks: { delta: -0.48, gamma: 0.014, theta: -13.0, vega: 4.2 } } },
      { strike: 23500, ce: { ltp: 132.4, changePct: -7.8, oi: 74200, changeOi: 5200, iv: 12.4, volume: 16800, bid: 132.0, ask: 132.8, greeks: { delta: 0.46, gamma: 0.015, theta: -12.8, vega: 4.5 } }, pe: { ltp: 212.5, changePct: 74.8, oi: 73500, changeOi: 4800, iv: 13.0, volume: 15600, bid: 212.0, ask: 213.0, greeks: { delta: -0.54, gamma: 0.015, theta: -13.8, vega: 4.5 } } },
      { strike: 23600, ce: { ltp: 92.5, changePct: -5.8, oi: 69800, changeOi: 4100, iv: 12.2, volume: 13400, bid: 92.1, ask: 92.9, greeks: { delta: 0.39, gamma: 0.013, theta: -11.6, vega: 4.1 } }, pe: { ltp: 278.4, changePct: 64.2, oi: 67200, changeOi: 3600, iv: 12.8, volume: 12900, bid: 277.9, ask: 278.9, greeks: { delta: -0.61, gamma: 0.013, theta: -14.6, vega: 4.6 } } },
      { strike: 23700, ce: { ltp: 62.1, changePct: -4.2, oi: 61500, changeOi: 3100, iv: 12.0, volume: 11100, bid: 61.8, ask: 62.5, greeks: { delta: 0.31, gamma: 0.012, theta: -10.2, vega: 3.7 } }, pe: { ltp: 354.2, changePct: 56.4, oi: 59800, changeOi: 2800, iv: 12.6, volume: 11500, bid: 353.6, ask: 354.8, greeks: { delta: -0.69, gamma: 0.012, theta: -15.4, vega: 4.8 } } },
    ],
  },
  MIDCPNIFTY: {
    label: 'MIDCP NIFTY',
    expiry: '29 AUG 2026',
    spot: 11624.8,
    pcr: 0.95,
    ivRank: 64,
    maxPain: 11600,
    support: 11500,
    resistance: 11750,
    trend: 'bearish',
    range: '11,500 - 11,750',
    chain: [
      { strike: 11400, ce: { ltp: 134.2, changePct: -14.2, oi: 42100, changeOi: 2100, iv: 13.8, volume: 6400, bid: 133.8, ask: 134.6, greeks: { delta: 0.65, gamma: 0.018, theta: -9.5, vega: 2.8 } }, pe: { ltp: 38.6, changePct: 124.5, oi: 44500, changeOi: 2800, iv: 14.5, volume: 7200, bid: 38.3, ask: 38.9, greeks: { delta: -0.35, gamma: 0.017, theta: -7.2, vega: 2.5 } } },
      { strike: 11500, ce: { ltp: 98.4, changePct: -9.8, oi: 48200, changeOi: 3100, iv: 13.4, volume: 8200, bid: 98.0, ask: 98.8, greeks: { delta: 0.56, gamma: 0.020, theta: -9.0, vega: 3.1 } }, pe: { ltp: 58.2, changePct: 104.2, oi: 49100, changeOi: 3200, iv: 14.1, volume: 8100, bid: 57.9, ask: 58.5, greeks: { delta: -0.44, gamma: 0.019, theta: -7.8, vega: 2.8 } } },
      { strike: 11600, ce: { ltp: 82.3, changePct: -5.4, oi: 51200, changeOi: 2800, iv: 13.1, volume: 8100, bid: 82.0, ask: 82.5, greeks: { delta: 0.52, gamma: 0.021, theta: -8.3, vega: 2.9 } }, pe: { ltp: 76.4, changePct: 88.6, oi: 52100, changeOi: 2700, iv: 13.8, volume: 8400, bid: 76.1, ask: 76.7, greeks: { delta: -0.48, gamma: 0.020, theta: -8.2, vega: 2.8 } } },
      { strike: 11700, ce: { ltp: 69.7, changePct: -4.8, oi: 49800, changeOi: 2200, iv: 12.9, volume: 7800, bid: 69.4, ask: 70.0, greeks: { delta: 0.46, gamma: 0.019, theta: -8.0, vega: 2.7 } }, pe: { ltp: 93.9, changePct: 77.4, oi: 47700, changeOi: 2100, iv: 13.5, volume: 7900, bid: 93.6, ask: 94.1, greeks: { delta: -0.54, gamma: 0.020, theta: -8.4, vega: 2.9 } } },
    ],
  },
};

const ACTIVE_TRADES: FnoTrade[] = [
  { id: 'O-5521', contract: 'NIFTY 24500 CE', symbol: 'NIFTY', side: 'BUY', qty: '1 lot', entry: 306.4, ltp: 312.85, pnl: 322.5, status: 'ACTIVE' },
  { id: 'O-5499', contract: 'BANKNIFTY 51200 PE', symbol: 'BANKNIFTY', side: 'SELL', qty: '1 lot', entry: 402.1, ltp: 388.8, pnl: 665.0, status: 'OPEN' },
  { id: 'O-5440', contract: 'RELIANCE AUG FUT', symbol: 'STOCK FUT', side: 'BUY', qty: '250', entry: 2879.2, ltp: 2892.45, pnl: 3312.5, status: 'CLOSED' },
  { id: 'O-5411', contract: 'NIFTY 24400 PE', symbol: 'NIFTY', side: 'BUY', qty: '1 lot', entry: 88.2, ltp: 0, pnl: -88.2, status: 'CANCELLED' },
  { id: 'O-5372', contract: 'FINNIFTY 23400 CE', symbol: 'FINNIFTY', side: 'BUY', qty: '2 lots', entry: 126.5, ltp: 132.4, pnl: 1180.0, status: 'ACTIVE' },
];

const INDEX_ORDER: UnderlyingKey[] = ['NIFTY', 'SENSEX', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY'];
const STATUS_TABS: TradeStatus[] = ['OPEN', 'ACTIVE', 'CANCELLED', 'CLOSED'];

const TestingTradeFNO = () => {
  const [selectedIndex, setSelectedIndex] = useState<UnderlyingKey>('NIFTY');
  const [selectedStrike, setSelectedStrike] = useState<number>(24500);
  const [quoteMetric, setQuoteMetric] = useState<QuoteMetric>('ltp');
  const [statusFilter, setStatusFilter] = useState<TradeStatus | 'ALL'>('ALL');

  const indexData = UNDERLYINGS[selectedIndex];
  const chain = indexData.chain;

  const selectedRow = useMemo(
    () => chain.find((row) => row.strike === selectedStrike) ?? chain[Math.floor(chain.length / 2)],
    [chain, selectedStrike],
  );

  const selectedPrice = useMemo(() => {
    if (quoteMetric === 'changePct') {
      return `${selectedRow.ce.changePct >= 0 ? '+' : ''}${selectedRow.ce.changePct}%`;
    }

    return formatCurrency(selectedRow.ce.ltp);
  }, [quoteMetric, selectedRow.ce.changePct, selectedRow.ce.ltp]);

  const filteredTrades = useMemo(
    () => ACTIVE_TRADES.filter((trade) => statusFilter === 'ALL' || trade.status === statusFilter),
    [statusFilter],
  );

  const counts = useMemo(
    () => STATUS_TABS.reduce<Record<TradeStatus, number>>((accumulator, status) => {
      accumulator[status] = ACTIVE_TRADES.filter((trade) => trade.status === status).length;
      return accumulator;
    }, { OPEN: 0, ACTIVE: 0, CANCELLED: 0, CLOSED: 0 }),
    [],
  );

  return (
    <TerminalWorkspace>
      <div className="flex flex-col min-h-full w-full flex-1">
        <TerminalPanel
          title="FNO_OPTION_CHAIN"
          className="min-h-full flex-1"
          bodyClassName="overflow-visible"
        >
          <div className="min-h-full p-4 md:p-6 space-y-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-500 font-mono text-[10px] uppercase tracking-[0.35em]">
                <BarChart3 size={12} />
                Index options board
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">F&O option chain desk</h2>
                <p className="mt-2 max-w-2xl text-sm text-gray-500 font-mono">
                  Professional index selection, option-chain pricing, greeks, and active trade state across the main derivatives universe.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href="/testing/trade" className="px-3 py-2 border border-gray-700 text-gray-500 text-[10px] font-mono uppercase tracking-[0.3em] hover:border-amber-500 hover:text-amber-500 transition-colors">
                Back to trade kit
              </Link>
              <span className="px-3 py-2 border border-amber-500 bg-amber-500/10 text-amber-300 text-[10px] font-mono uppercase tracking-[0.3em]">
                Live chain
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
            {INDEX_ORDER.map((indexKey) => {
              const isActive = indexKey === selectedIndex;
              const data = UNDERLYINGS[indexKey];

              return (
                <button
                  key={indexKey}
                  type="button"
                  onClick={() => {
                    setSelectedIndex(indexKey);
                    setSelectedStrike(data.chain[Math.floor(data.chain.length / 2)]?.strike ?? data.chain[0].strike);
                  }}
                  className={`min-w-[130px] border px-4 py-3 text-left transition-colors ${isActive ? 'border-amber-500 bg-amber-500/10' : 'border-gray-700 bg-black hover:border-amber-500/60'}`}
                >
                  <div className="text-[9px] font-mono uppercase tracking-[0.32em] text-gray-500">{data.label}</div>
                  <div className="mt-1 text-sm font-semibold text-white">{formatCurrency(data.spot)}</div>
                  <div className={`mt-1 text-[10px] font-mono uppercase tracking-[0.28em] ${data.trend === 'bullish' ? 'text-green-500' : data.trend === 'bearish' ? 'text-red-500' : 'text-amber-500'}`}>
                    {data.range}
                  </div>
                </button>
              );
            })}
          </div>

          <TerminalGrid variant="split-8-4" className="min-h-0 flex-1">
            <div className="lg:col-span-8 min-h-0">
              <TerminalPanel title={`OPTION_CHAIN // ${indexData.label}`} className="h-full">
                <div className="p-4 md:p-5 space-y-4 min-h-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="border border-gray-800 bg-black p-4">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">Spot</div>
                      <div className="mt-2 text-xl font-semibold text-white">{formatCurrency(indexData.spot)}</div>
                    </div>
                    <div className="border border-gray-800 bg-black p-4">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">PCR</div>
                      <div className="mt-2 text-xl font-semibold text-white">{indexData.pcr}</div>
                    </div>
                    <div className="border border-gray-800 bg-black p-4">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">Max pain</div>
                      <div className="mt-2 text-xl font-semibold text-white">{indexData.maxPain}</div>
                    </div>
                    <div className="border border-gray-800 bg-black p-4">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">IV rank</div>
                      <div className="mt-2 text-xl font-semibold text-white">{indexData.ivRank}%</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">
                      <ShieldCheck size={12} className="text-amber-500" />
                      Strike ladder for {indexData.expiry}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">Metric</span>
                      <button
                        type="button"
                        onClick={() => setQuoteMetric((current) => (current === 'ltp' ? 'changePct' : 'ltp'))}
                        className="inline-flex items-center gap-2 border border-gray-700 bg-black px-3 py-2 text-[10px] font-mono uppercase tracking-[0.3em] text-gray-300 hover:border-amber-500 hover:text-amber-500 transition-colors"
                      >
                        {quoteMetric === 'ltp' ? 'LTP' : 'Chng%'}
                        <ChevronDown size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-gray-800 bg-gray-950/70">
                    <table className="min-w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-gray-800 bg-black text-[10px] uppercase tracking-[0.32em] text-gray-500">
                          <th className="p-3 font-normal">CALL</th>
                          <th className="p-3 font-normal">OI</th>
                          <th className="p-3 font-normal">IV</th>
                          <th className="p-3 font-normal">LTP</th>
                          <th className="p-3 font-normal text-center text-amber-400">Strike Price</th>
                          <th className="p-3 font-normal">LTP</th>
                          <th className="p-3 font-normal">IV</th>
                          <th className="p-3 font-normal">OI</th>
                          <th className="p-3 font-normal">PUT</th>
                        </tr>
                        <tr className="border-b border-gray-800 text-[9px] uppercase tracking-[0.3em] text-gray-600">
                          <th className="p-2">Chng%</th>
                          <th className="p-2">Chng OI</th>
                          <th className="p-2">Volume</th>
                          <th className="p-2">LTP</th>
                          <th className="p-2 text-center text-gray-400">Spot {indexData.expiry}</th>
                          <th className="p-2">LTP</th>
                          <th className="p-2">Volume</th>
                          <th className="p-2">Chng OI</th>
                          <th className="p-2">Chng%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chain.map((row) => {
                          const isSelected = row.strike === selectedStrike;

                          return (
                            <tr
                              key={row.strike}
                              onClick={() => setSelectedStrike(row.strike)}
                              className={`cursor-pointer border-b border-gray-900 transition-colors ${isSelected ? 'bg-amber-500/10' : 'hover:bg-gray-900/60'}`}
                            >
                              <td className={`p-3 ${row.ce.changePct >= 0 ? 'text-green-500' : 'text-red-400'}`}>{row.ce.changePct.toFixed(2)}%</td>
                              <td className="p-3 text-gray-200">{formatCompact(row.ce.changeOi)}</td>
                              <td className="p-3 text-gray-400">{formatCompact(row.ce.volume)}</td>
                              <td className="p-3 text-red-400">{quoteMetric === 'ltp' ? formatCurrency(row.ce.ltp) : `${row.ce.changePct >= 0 ? '+' : ''}${row.ce.changePct.toFixed(2)}%`}</td>
                              <td className="p-3 text-center text-white font-semibold text-sm bg-gray-950/80">{row.strike}</td>
                              <td className="p-3 text-green-400">{quoteMetric === 'ltp' ? formatCurrency(row.pe.ltp) : `${row.pe.changePct >= 0 ? '+' : ''}${row.pe.changePct.toFixed(2)}%`}</td>
                              <td className="p-3 text-gray-400">{formatCompact(row.pe.volume)}</td>
                              <td className="p-3 text-gray-200">{formatCompact(row.pe.changeOi)}</td>
                              <td className={`p-3 ${row.pe.changePct >= 0 ? 'text-green-500' : 'text-red-400'}`}>{row.pe.changePct.toFixed(2)}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="border border-gray-800 bg-black p-4">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">Selected strike</div>
                      <div className="mt-2 text-xl font-semibold text-white">{selectedRow.strike}</div>
                      <div className="mt-1 text-xs font-mono text-gray-500">Spot {formatCurrency(indexData.spot)}</div>
                    </div>
                    <div className="border border-gray-800 bg-black p-4">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">Call premium</div>
                      <div className="mt-2 text-xl font-semibold text-green-400">{selectedPrice}</div>
                      <div className="mt-1 text-xs font-mono text-gray-500">Bid {formatCurrency(selectedRow.ce.bid)} / Ask {formatCurrency(selectedRow.ce.ask)}</div>
                    </div>
                    <div className="border border-gray-800 bg-black p-4">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">Put premium</div>
                      <div className="mt-2 text-xl font-semibold text-red-400">{formatCurrency(selectedRow.pe.ltp)}</div>
                      <div className="mt-1 text-xs font-mono text-gray-500">Bid {formatCurrency(selectedRow.pe.bid)} / Ask {formatCurrency(selectedRow.pe.ask)}</div>
                    </div>
                  </div>
                </div>
              </TerminalPanel>
            </div>

            <div className="lg:col-span-4 min-h-0 space-y-px bg-gray-800">
              <TerminalPanel title="CONTRACT_DETAIL" className="h-1/2">
                <div className="p-4 space-y-4">
                  <div className="border border-gray-800 bg-black p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-amber-500">{indexData.label}</div>
                        <div className="mt-2 text-xl font-semibold text-white">{indexData.expiry}</div>
                      </div>
                      <TriangleAlert size={16} className="text-amber-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div><div className="text-gray-600">Support</div><div className="mt-1 text-white">{indexData.support}</div></div>
                      <div><div className="text-gray-600">Resistance</div><div className="mt-1 text-white">{indexData.resistance}</div></div>
                      <div><div className="text-gray-600">Trend</div><div className={`mt-1 ${indexData.trend === 'bullish' ? 'text-green-500' : indexData.trend === 'bearish' ? 'text-red-500' : 'text-amber-500'}`}>{indexData.trend.toUpperCase()}</div></div>
                      <div><div className="text-gray-600">Range</div><div className="mt-1 text-white">{indexData.range}</div></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-gray-800 bg-gray-950/70 p-3">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">CE Greeks</div>
                      <div className="mt-2 space-y-1 text-xs font-mono text-gray-300">
                        <div>Δ {selectedRow.ce.greeks.delta}</div>
                        <div>Γ {selectedRow.ce.greeks.gamma}</div>
                        <div>Θ {selectedRow.ce.greeks.theta}</div>
                        <div>V {selectedRow.ce.greeks.vega}</div>
                      </div>
                    </div>
                    <div className="border border-gray-800 bg-gray-950/70 p-3">
                      <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">PE Greeks</div>
                      <div className="mt-2 space-y-1 text-xs font-mono text-gray-300">
                        <div>Δ {selectedRow.pe.greeks.delta}</div>
                        <div>Γ {selectedRow.pe.greeks.gamma}</div>
                        <div>Θ {selectedRow.pe.greeks.theta}</div>
                        <div>V {selectedRow.pe.greeks.vega}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-800 bg-black p-4 space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-gray-500">Premium state</div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div><div className="text-gray-600">CE OI</div><div className="mt-1 text-white">{formatCompact(selectedRow.ce.oi)}</div></div>
                      <div><div className="text-gray-600">PE OI</div><div className="mt-1 text-white">{formatCompact(selectedRow.pe.oi)}</div></div>
                      <div><div className="text-gray-600">CE IV</div><div className="mt-1 text-white">{selectedRow.ce.iv}%</div></div>
                      <div><div className="text-gray-600">PE IV</div><div className="mt-1 text-white">{selectedRow.pe.iv}%</div></div>
                    </div>
                  </div>

                  <button className="w-full inline-flex items-center justify-center gap-2 border border-amber-500 bg-amber-500 text-black px-4 py-3 text-[10px] font-bold font-mono uppercase tracking-[0.32em] hover:bg-amber-400 transition-colors">
                    Route selected contract
                    <ArrowUpRight size={12} />
                  </button>
                </div>
              </TerminalPanel>

              <TerminalPanel title="ACTIVE_TRADES" className="h-1/2">
                <div className="p-4 space-y-3 h-full">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('ALL')}
                      className={`px-3 py-1.5 border text-[10px] font-mono uppercase tracking-[0.3em] ${statusFilter === 'ALL' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-gray-700 text-gray-500'}`}
                    >
                      All
                    </button>
                    {STATUS_TABS.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 border text-[10px] font-mono uppercase tracking-[0.3em] ${statusFilter === status ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-gray-700 text-gray-500'}`}
                      >
                        {status} {counts[status]}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 max-h-[calc(100%-3rem)] overflow-auto pr-1">
                    {filteredTrades.map((trade) => (
                      <div key={trade.id} className="border border-gray-800 bg-black p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-white">{trade.contract}</div>
                            <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">
                              {trade.symbol}{' // '}{trade.side}{' // '}{trade.qty}
                            </div>
                          </div>
                          <span className={`text-[9px] font-mono uppercase tracking-[0.3em] ${trade.status === 'ACTIVE' ? 'text-green-500' : trade.status === 'OPEN' ? 'text-amber-500' : trade.status === 'CANCELLED' ? 'text-red-500' : 'text-gray-500'}`}>
                            {trade.status}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-mono">
                          <div><div className="text-gray-600">Entry</div><div className="mt-1 text-white">{formatCurrency(trade.entry)}</div></div>
                          <div><div className="text-gray-600">LTP</div><div className="mt-1 text-white">{trade.ltp > 0 ? formatCurrency(trade.ltp) : 'n/a'}</div></div>
                          <div><div className="text-gray-600">PnL</div><div className={`mt-1 ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(trade.pnl)}</div></div>
                          <div><div className="text-gray-600">State</div><div className="mt-1 text-white uppercase">{trade.status}</div></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TerminalPanel>
            </div>
          </TerminalGrid>
        </div>
      </TerminalPanel>
    </div>
    </TerminalWorkspace>
  );
};

export default TestingTradeFNO;
