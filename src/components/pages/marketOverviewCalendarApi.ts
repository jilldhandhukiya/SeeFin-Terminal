export type MarketHolidayExchangeWindow = {
  exchange: string;
  start_time: number;
  end_time: number;
};

export type MarketHolidayRecord = {
  date: string;
  description: string;
  holiday_type: 'SETTLEMENT_HOLIDAY' | 'TRADING_HOLIDAY' | 'SPECIAL_TIMING' | string;
  closed_exchanges: string[];
  open_exchanges: MarketHolidayExchangeWindow[];
};

export type MarketHolidaysResponse = {
  status: string;
  data: MarketHolidayRecord[];
};

const MARKET_HOLIDAYS_BASE_URL = 'https://api.upstox.com/v2/market/holidays';

const buildMarketHolidaysUrl = (date?: string) => {
  const url = new URL(MARKET_HOLIDAYS_BASE_URL);

  if (date) {
    url.pathname = `${url.pathname.replace(/\/$/, '')}/${date}`;
  }

  return url;
};

export const fetchMarketHolidays = async (date?: string, signal?: AbortSignal) => {
  const response = await fetch(buildMarketHolidaysUrl(date), {
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Holiday data request failed (${response.status})`);
  }

  return response.json() as Promise<MarketHolidaysResponse>;
};
