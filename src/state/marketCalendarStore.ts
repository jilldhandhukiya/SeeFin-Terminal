import { create } from 'zustand';
import {
  fetchMarketHolidays,
  getCachedMarketHolidays,
  type MarketHolidayRecord,
} from '@/components/pages/marketOverviewCalendarApi';

type HolidayDetailsByDate = Record<string, MarketHolidayRecord[]>;

type MarketCalendarState = {
  holidayIndex: MarketHolidayRecord[];
  holidayDetailsByDate: HolidayDetailsByDate;
  loadedYear: number | null;
  isLoadingHolidays: boolean;
  holidayError: string | null;
  lastRefreshedAt: number | null;
  isCached: boolean;
  loadHolidayIndex: (options?: { force?: boolean }) => Promise<void>;
  refreshHolidayIndex: () => Promise<void>;
  getHolidayDetailsForDate: (date: string) => MarketHolidayRecord[];
};

const groupHolidaysByDate = (records: MarketHolidayRecord[]) => {
  return records.reduce<HolidayDetailsByDate>((accumulator, record) => {
    const bucket = accumulator[record.date] ?? [];
    bucket.push(record);
    accumulator[record.date] = bucket;
    return accumulator;
  }, {});
};

const getInitialState = () => {
  const cached = getCachedMarketHolidays();
  if (cached && cached.data.length > 0) {
    return {
      holidayIndex: cached.data,
      holidayDetailsByDate: groupHolidaysByDate(cached.data),
      loadedYear: new Date().getFullYear(),
      lastRefreshedAt: cached.timestamp,
      isCached: true,
    };
  }
  return {
    holidayIndex: [],
    holidayDetailsByDate: {},
    loadedYear: null,
    lastRefreshedAt: null,
    isCached: false,
  };
};

export const useMarketCalendarStore = create<MarketCalendarState>((set, get) => {
  const initial = getInitialState();

  return {
    holidayIndex: initial.holidayIndex,
    holidayDetailsByDate: initial.holidayDetailsByDate,
    loadedYear: initial.loadedYear,
    isLoadingHolidays: false,
    holidayError: null,
    lastRefreshedAt: initial.lastRefreshedAt,
    isCached: initial.isCached,
    loadHolidayIndex: async (options) => {
      const currentYear = new Date().getFullYear();
      const hasData = get().holidayIndex.length > 0;
      const shouldSkipLoad = !options?.force && get().loadedYear === currentYear && hasData;

      if (shouldSkipLoad) {
        return;
      }

      if (!options?.force) {
        const cached = getCachedMarketHolidays();
        if (cached && cached.data.length > 0) {
          set({
            holidayIndex: cached.data,
            holidayDetailsByDate: groupHolidaysByDate(cached.data),
            loadedYear: currentYear,
            lastRefreshedAt: cached.timestamp,
            isCached: true,
            isLoadingHolidays: false,
            holidayError: null,
          });
          return;
        }
      }

      set({ isLoadingHolidays: true, holidayError: null });

      try {
        const response = await fetchMarketHolidays(undefined, { force: options?.force });
        const grouped = groupHolidaysByDate(response.data);
        set({
          holidayIndex: response.data,
          holidayDetailsByDate: grouped,
          loadedYear: currentYear,
          lastRefreshedAt: Date.now(),
          isCached: false,
          holidayError: null,
        });
      } catch (error) {
        set({
          holidayError: error instanceof Error ? error.message : 'Unable to load market holidays.',
        });
      } finally {
        set({ isLoadingHolidays: false });
      }
    },
    refreshHolidayIndex: async () => {
      await get().loadHolidayIndex({ force: true });
    },
    getHolidayDetailsForDate: (date) => {
      return get().holidayDetailsByDate[date] ?? [];
    },
  };
});
