export type PaperTradeStatus = 'OPEN' | 'ACTIVE' | 'CANCELLED' | 'CLOSED';
export type PaperTradeSide = 'BUY' | 'SELL';
export type PaperOrderType = 'MARKET' | 'LIMIT';

export type PaperTradeRecord = {
  id: string;
  exchange: string;
  tradingsymbol: string;
  symboltoken: string;
  side: PaperTradeSide;
  orderType: PaperOrderType;
  quantity: number;
  limitPrice: number | null;
  entryPrice: number | null;
  exitPrice: number | null;
  lastPrice: number | null;
  status: PaperTradeStatus;
  rejectReason: string;
  createdAt: string;
  updatedAt: string;
  closedAt: string;
};
