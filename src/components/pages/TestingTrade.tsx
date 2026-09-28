'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import TerminalPanel from '@/components/ui/TerminalPanel';
import TerminalWorkspace from '@/components/layout/TerminalWorkspace';
import TerminalGrid from '@/components/layout/TerminalGrid';
import { formatCurrency } from '@/utils/formatting';
import { getPaperTradePnl, usePaperTradeStore } from '@/state/paperTradeStore';
import type { PaperTradeStatus } from '@/types/trade';
import {
  ArrowUpRight,
  Ban,
  CheckCircle2,
  History,
  Play,
  RefreshCcw,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

const STATUS_TABS: PaperTradeStatus[] = ['OPEN', 'ACTIVE', 'CANCELLED', 'CLOSED'];

const priceFromPaise = (value: string | undefined): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed / 100 : 0;
};

const statusClass = (status: PaperTradeStatus): string => {
  if (status === 'ACTIVE') return 'text-green-500';
  if (status === 'OPEN') return 'text-amber-500';
  if (status === 'CANCELLED') return 'text-red-500';
  return 'text-gray-500';
};

const TestingTrade = () => {
  const [statusFilter, setStatusFilter] = useState<PaperTradeStatus | 'ALL'>('ALL');
  const {
    draft,
    searchResults,
    coinResults,
    selected,
    selectedCoin,
    quote,
    coinOrderBook,
    coinTrades,
    smartApiDetails,
    trades,
    loadingSearch,
    loadingQuote,
    executing,
    error,
    message,
    setDraft,
    searchScrips,
    selectScrip,
    refreshQuote,
    executeTrade,
    activateTrade,
    cancelTrade,
    closeTrade,
  } = usePaperTradeStore();

  const ltp = priceFromPaise(quote?.ltp);
  const displayLtp = draft.venue === 'COINDCX' ? selectedCoin?.lastPrice ?? 0 : ltp;
  const open = priceFromPaise(quote?.open);
  const high = priceFromPaise(quote?.high);
  const low = priceFromPaise(quote?.low);
  const close = priceFromPaise(quote?.close);
  const change = draft.venue === 'COINDCX'
    ? selectedCoin?.changePercent ?? 0
    : close ? ((ltp - close) / close) * 100 : 0;
  const displayedResults = draft.venue === 'COINDCX' ? coinResults : searchResults;

  const filteredTrades = useMemo(
    () => trades.filter((trade) => statusFilter === 'ALL' || trade.status === statusFilter),
    [statusFilter, trades],
  );

  const statusCounts = useMemo(
    () => STATUS_TABS.reduce<Record<PaperTradeStatus, number>>((accumulator, status) => {
      accumulator[status] = trades.filter((trade) => trade.status === status).length;
      return accumulator;
    }, { OPEN: 0, ACTIVE: 0, CANCELLED: 0, CLOSED: 0 }),
    [trades],
  );

  const activePnl = trades
    .filter((trade) => trade.status === 'ACTIVE')
    .reduce((total, trade) => total + getPaperTradePnl(trade), 0);

  return (
    <TerminalWorkspace>
      <div className="flex flex-col min-h-full w-full flex-1">
        <TerminalPanel
          title="TRADE_TESTING_DESK"
          className="min-h-full flex-1"
          bodyClassName="overflow-visible"
        >
          <div className="flex min-h-full flex-col gap-4 p-4 md:p-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-500 font-mono text-[10px] uppercase tracking-[0.35em]">
                <Play size={12} />
                SmartAPI + CoinDCX paper trading cockpit
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Equity trade testing kit</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-3 py-2 border border-amber-500 bg-amber-500/10 text-amber-300 text-[10px] font-mono uppercase tracking-[0.32em]"
              >
                {draft.venue === 'SMARTAPI' ? 'Stocks' : 'Crypto'}
              </button>
              <Link
                href="/testing/trade/fno"
                className="inline-flex items-center gap-2 px-3 py-2 border border-gray-700 text-gray-500 text-[10px] font-mono uppercase tracking-[0.32em] hover:border-amber-500 hover:text-amber-500 transition-colors"
              >
                F&O chain
                <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>

          <TerminalGrid variant="split-8-4">
            <div className="xl:col-span-8">
              <TerminalPanel title="SMARTAPI_STOCK_SEARCH_AND_TICKET" className="h-full min-h-[500px]">
                <div className="h-full overflow-auto p-4 md:p-5 space-y-4">
                  <div className="grid gap-3 lg:grid-cols-[0.8fr_0.7fr_1.5fr_auto]">
                    <div>
                      <div className="mb-1 text-[9px] font-mono uppercase tracking-widest text-amber-600">Venue</div>
                      <div className="grid grid-cols-2 gap-1">
                        {(['SMARTAPI', 'COINDCX'] as const).map((venue) => (
                          <button
                            key={venue}
                            type="button"
                            onClick={() => setDraft({ venue, search: venue === 'COINDCX' ? 'BTC' : 'SBIN' })}
                            className={`border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest ${draft.venue === venue ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-gray-800 text-gray-500'}`}
                          >
                            {venue === 'SMARTAPI' ? 'Stocks' : 'Crypto'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 text-[9px] font-mono uppercase tracking-widest text-amber-600">
                        {draft.venue === 'COINDCX' ? 'Product' : 'Exchange'}
                      </div>
                      {draft.venue === 'COINDCX' ? (
                        <div className="grid grid-cols-2 gap-1">
                          {(['futures', 'spot'] as const).map((coinProduct) => (
                            <button
                              key={coinProduct}
                              type="button"
                              onClick={() => setDraft({ coinProduct })}
                              className={`border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest ${draft.coinProduct === coinProduct ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-gray-800 text-gray-500'}`}
                            >
                              {coinProduct}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input
                          value={draft.exchange}
                          onChange={(event) => setDraft({ exchange: event.target.value.toUpperCase() })}
                          className="w-full border border-gray-800 bg-gray-950 px-3 py-2 font-mono text-xs text-white outline-none focus:border-amber-500"
                        />
                      )}
                    </div>
                    <div className="relative">
                      <div className="mb-1 text-[9px] font-mono uppercase tracking-widest text-amber-600">Search instrument</div>
                      <input
                        value={draft.search}
                        onChange={(event) => setDraft({ search: event.target.value.toUpperCase() })}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') void searchScrips();
                        }}
                        placeholder={draft.venue === 'COINDCX' ? 'BTC / ETH / SHIB' : 'SBIN'}
                        className="w-full border border-gray-800 bg-gray-950 px-3 py-2 font-mono text-xs text-white outline-none focus:border-amber-500"
                      />
                      {displayedResults.length > 0 && (
                        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-auto border border-gray-800 bg-black shadow-2xl">
                          {draft.venue === 'COINDCX'
                            ? coinResults.map((instrument) => (
                              <button
                                key={`${instrument.product}-${instrument.pair}`}
                                type="button"
                                onClick={() => void selectScrip({ exchange: 'COINDCX', tradingsymbol: instrument.symbol, symboltoken: instrument.pair })}
                                className={`block w-full border-b border-gray-900 px-3 py-3 text-left transition-colors ${selectedCoin?.pair === instrument.pair ? 'bg-amber-500/10' : 'hover:bg-gray-950'}`}
                              >
                                <div className="text-sm font-semibold text-white">{instrument.symbol}</div>
                                <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.25em] text-gray-500">
                                  {instrument.product}{' // '}{instrument.pair}{' // '}{instrument.lastPrice || 'n/a'}
                                </div>
                              </button>
                            ))
                            : searchResults.map((scrip) => (
                              <button
                                key={`${scrip.exchange}-${scrip.symboltoken}-${scrip.tradingsymbol}`}
                                type="button"
                                onClick={() => void selectScrip(scrip)}
                                className={`block w-full border-b border-gray-900 px-3 py-3 text-left transition-colors ${selected?.symboltoken === scrip.symboltoken ? 'bg-amber-500/10' : 'hover:bg-gray-950'}`}
                              >
                                <div className="text-sm font-semibold text-white">{scrip.tradingsymbol}</div>
                                <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.25em] text-gray-500">
                                  {scrip.exchange}{' // token '}{scrip.symboltoken}
                                </div>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => void searchScrips()}
                      disabled={loadingSearch}
                      className="inline-flex items-center justify-center gap-2 border border-amber-500 bg-amber-500 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-black transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500 lg:mt-4"
                    >
                      <Search size={12} />
                      {loadingSearch ? 'Searching' : 'Search'}
                    </button>
                  </div>

                  {(error || message) && (
                    <div className={`border border-gray-800 bg-black p-3 text-xs font-mono ${error ? 'text-red-400' : 'text-green-500'}`}>
                      {error || message}
                    </div>
                  )}

                  <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="border border-gray-800 bg-black p-4 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-amber-500">Instrument details</div>
                          <div className="mt-2 text-xl font-semibold tracking-tight text-white">
                            {draft.venue === 'COINDCX' ? selectedCoin?.symbol ?? 'No instrument selected' : selected?.tradingsymbol ?? 'No instrument selected'}
                          </div>
                          <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.25em] text-gray-500">
                            {draft.venue === 'COINDCX'
                              ? selectedCoin ? `${selectedCoin.product} // ${selectedCoin.pair}` : 'Search and select CoinDCX market'
                              : selected ? `${selected.exchange} // ${selected.symboltoken}` : 'Search and select a SmartAPI scrip'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void refreshQuote()}
                          disabled={(!selected && !selectedCoin) || loadingQuote}
                          className="inline-flex items-center gap-2 border border-gray-700 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-gray-400 transition-colors hover:border-amber-500 hover:text-amber-500 disabled:cursor-not-allowed disabled:text-gray-700"
                        >
                          <RefreshCcw size={12} />
                          LTP
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {[
                          ['LTP', displayLtp ? String(displayLtp) : 'n/a', 'text-amber-400'],
                          ['Open', open ? formatCurrency(open) : selectedCoin?.markPrice ? String(selectedCoin.markPrice) : 'n/a', 'text-white'],
                          ['High', high ? formatCurrency(high) : selectedCoin?.high ? String(selectedCoin.high) : 'n/a', 'text-green-500'],
                          ['Low', low ? formatCurrency(low) : selectedCoin?.low ? String(selectedCoin.low) : 'n/a', 'text-red-500'],
                          ['Close', close ? formatCurrency(close) : 'n/a', 'text-white'],
                        ].map(([label, value, color]) => (
                          <div key={label} className="border border-gray-800 bg-gray-950/70 p-3">
                            <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">{label}</div>
                            <div className={`mt-1 text-sm font-mono ${color}`}>{value}</div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="border border-gray-800 bg-gray-950/70 p-3">
                          <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">Change vs close</div>
                          <div className={`mt-1 text-sm font-mono ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {close ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` : 'n/a'}
                          </div>
                        </div>
                        <div className="border border-gray-800 bg-gray-950/70 p-3">
                          <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">Active PnL</div>
                          <div className={`mt-1 text-sm font-mono ${activePnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(activePnl)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="border border-gray-800 bg-black p-4">
                        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500">
                          {draft.venue === 'COINDCX' ? 'Order book' : 'SmartAPI full quote'}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs font-mono">
                          {draft.venue === 'COINDCX' ? (
                            <>
                              <div>
                                <div className="text-gray-600">Best bid</div>
                                <div className="mt-1 text-green-500">{Object.keys(coinOrderBook?.bids ?? {})[0] ?? 'n/a'}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Best ask</div>
                                <div className="mt-1 text-red-500">{Object.keys(coinOrderBook?.asks ?? {})[0] ?? 'n/a'}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Recent trades</div>
                                <div className="mt-1 text-white">{coinTrades.length}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">24h volume</div>
                                <div className="mt-1 text-white">{selectedCoin?.volume ?? 'n/a'}</div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <div className="text-gray-600">Fetched rows</div>
                                <div className="mt-1 text-white">{smartApiDetails.length}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Volume</div>
                                <div className="mt-1 text-white">{String((smartApiDetails[0] as { tradeVolume?: unknown } | undefined)?.tradeVolume ?? 'n/a')}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Total buy qty</div>
                                <div className="mt-1 text-green-500">{String((smartApiDetails[0] as { totBuyQuan?: unknown } | undefined)?.totBuyQuan ?? 'n/a')}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Total sell qty</div>
                                <div className="mt-1 text-red-500">{String((smartApiDetails[0] as { totSellQuan?: unknown } | undefined)?.totSellQuan ?? 'n/a')}</div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-800 bg-black p-4 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500">
                      <ShieldCheck size={12} />
                      Paper order ticket
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      <div>
                        <div className="mb-1 text-[9px] font-mono uppercase tracking-widest text-gray-600">Side</div>
                        <div className="grid grid-cols-2 gap-1">
                          {(['BUY', 'SELL'] as const).map((side) => (
                            <button
                              key={side}
                              type="button"
                              onClick={() => setDraft({ side })}
                              className={`border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest ${draft.side === side ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-gray-800 text-gray-500'}`}
                            >
                              {side}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-[9px] font-mono uppercase tracking-widest text-gray-600">Order</div>
                        <div className="grid grid-cols-2 gap-1">
                          {(['MARKET', 'LIMIT'] as const).map((orderType) => (
                            <button
                              key={orderType}
                              type="button"
                              onClick={() => setDraft({ orderType })}
                              className={`border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-widest ${draft.orderType === orderType ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-gray-800 text-gray-500'}`}
                            >
                              {orderType}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-[9px] font-mono uppercase tracking-widest text-gray-600">Quantity</div>
                        <input
                          value={draft.quantity}
                          onChange={(event) => setDraft({ quantity: event.target.value })}
                          inputMode="decimal"
                          className="w-full border border-gray-800 bg-gray-950 px-3 py-2 font-mono text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <div className="mb-1 text-[9px] font-mono uppercase tracking-widest text-gray-600">Limit price</div>
                        <input
                          value={draft.limitPrice}
                          onChange={(event) => setDraft({ limitPrice: event.target.value })}
                          disabled={draft.orderType !== 'LIMIT'}
                          inputMode="decimal"
                          placeholder={ltp ? ltp.toFixed(2) : '0.00'}
                          className="w-full border border-gray-800 bg-gray-950 px-3 py-2 font-mono text-xs text-white outline-none focus:border-amber-500 disabled:text-gray-700"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => void executeTrade()}
                        disabled={(!selected && !selectedCoin) || executing}
                        className="inline-flex items-center justify-center gap-2 border border-amber-500 bg-amber-500 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-black transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500 lg:mt-4"
                      >
                        <CheckCircle2 size={12} />
                        Execute
                      </button>
                    </div>
                  </div>
                </div>
              </TerminalPanel>
            </div>

            <div className="xl:col-span-4">
              <TerminalPanel title="PAPER_TRADE_BLOTTER" className="h-full min-h-[500px]">
                <div className="h-full overflow-auto p-4 md:p-5 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setStatusFilter('ALL')}
                      className={`px-3 py-1.5 border text-[10px] font-mono uppercase tracking-[0.3em] ${statusFilter === 'ALL' ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-gray-700 text-gray-500'}`}
                    >
                      All {trades.length}
                    </button>
                    {STATUS_TABS.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 border text-[10px] font-mono uppercase tracking-[0.3em] ${statusFilter === status ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-gray-700 text-gray-500'}`}
                      >
                        {status} {statusCounts[status]}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    {filteredTrades.map((trade) => {
                      const pnl = getPaperTradePnl(trade);
                      return (
                        <div key={trade.id} className="border border-gray-800 bg-black p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-white">{trade.tradingsymbol}</div>
                              <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.25em] text-gray-500">
                                {trade.exchange}{' // '}{trade.side}{' // '}{trade.orderType}{' // '}{trade.symboltoken}
                              </div>
                            </div>
                            <span className={`text-[9px] font-mono uppercase tracking-[0.3em] ${statusClass(trade.status)}`}>
                              {trade.status}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono sm:grid-cols-4">
                            <div><div className="text-gray-600">Qty</div><div className="mt-1 text-white">{trade.quantity}</div></div>
                            <div><div className="text-gray-600">Entry</div><div className="mt-1 text-white">{trade.entryPrice ? formatCurrency(trade.entryPrice) : 'pending'}</div></div>
                            <div><div className="text-gray-600">LTP</div><div className="mt-1 text-white">{trade.lastPrice ? formatCurrency(trade.lastPrice) : 'n/a'}</div></div>
                            <div><div className="text-gray-600">PnL</div><div className={`mt-1 ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(pnl)}</div></div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {trade.status === 'OPEN' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void activateTrade(trade.id)}
                                  className="inline-flex items-center gap-2 border border-green-700 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-green-500 hover:border-green-500"
                                >
                                  <Play size={12} />
                                  Activate
                                </button>
                                <button
                                  type="button"
                                  onClick={() => cancelTrade(trade.id)}
                                  className="inline-flex items-center gap-2 border border-red-900 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-red-500 hover:border-red-500"
                                >
                                  <Ban size={12} />
                                  Cancel
                                </button>
                              </>
                            )}
                            {trade.status === 'ACTIVE' && (
                              <button
                                type="button"
                                onClick={() => void closeTrade(trade.id)}
                                className="inline-flex items-center gap-2 border border-amber-500 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-amber-500 hover:bg-amber-500 hover:text-black"
                              >
                                <XCircle size={12} />
                                Close trade
                              </button>
                            )}
                            <div suppressHydrationWarning className="ml-auto flex items-center gap-2 text-[10px] font-mono text-gray-600">
                              <History size={12} />
                              {new Date(trade.updatedAt).toLocaleTimeString('en-US')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {!filteredTrades.length && (
                      <div className="border border-gray-800 bg-black px-4 py-10 text-center text-xs font-mono text-gray-600">
                        No paper trades in this state.
                      </div>
                    )}
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

export default TestingTrade;
