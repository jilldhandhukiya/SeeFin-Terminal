export type SmartApiScrip = {
  exchange: string;
  tradingsymbol: string;
  symboltoken: string;
};

export type SmartApiLtpQuote = SmartApiScrip & {
  open?: string;
  high?: string;
  low?: string;
  close?: string;
  ltp?: string;
};

export type CoinDcxOrderBook = {
  ts?: number;
  vs?: number;
  asks: Record<string, string>;
  bids: Record<string, string>;
};

export type CoinDcxTrade = {
  p?: number;
  q?: number;
  s?: string;
  T?: number;
  m?: boolean;
  price?: number;
  quantity?: number;
  timestamp?: number;
  is_maker?: boolean;
};

export type CoinDcxInstrument = {
  pair: string;
  symbol: string;
  product: 'spot' | 'futures';
  lastPrice: number;
  markPrice?: number;
  high?: number;
  low?: number;
  volume?: number;
  changePercent?: number;
  detail?: {
    coindcx_name: string;
    base_currency_short_name: string;
    target_currency_short_name: string;
    target_currency_name: string;
    base_currency_name: string;
    min_quantity: number;
    max_quantity: number;
    min_price: number;
    max_price: number;
    min_notional: number;
    base_currency_precision: number;
    target_currency_precision: number;
    step: number;
    order_types: string[];
    symbol: string;
    ecode: string;
    pair: string;
    status: string;
  };
};
