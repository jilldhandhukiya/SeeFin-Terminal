import { create } from 'zustand';
import { fetchMarketHolidays, type MarketHolidayRecord } from '@/components/pages/marketOverviewCalendarApi';

type HolidayDetailsByDate = Record<string, MarketHolidayRecord[]>;

type MarketCalendarState = {
  holidayIndex: MarketHolidayRecord[];
  holidayDetailsByDate: HolidayDetailsByDate;
  loadedYear: number | null;
  isLoadingHolidays: boolean;
  holidayError: string | null;
  lastRefreshedAt: number | null;
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

export const useMarketCalendarStore = create<MarketCalendarState>((set, get) => ({
  holidayIndex: [],
  holidayDetailsByDate: {},
  loadedYear: null,
  isLoadingHolidays: false,
  holidayError: null,
  lastRefreshedAt: null,
  loadHolidayIndex: async (options) => {
    const currentYear = new Date().getFullYear();
    const shouldSkipLoad = !options?.force && get().loadedYear === currentYear && get().holidayIndex.length > 0;

    if (shouldSkipLoad) {
      return;
    }

    set({ isLoadingHolidays: true, holidayError: null });

    try {
      const response = await fetchMarketHolidays();
      set({
        holidayIndex: response.data,
        holidayDetailsByDate: groupHolidaysByDate(response.data),
        loadedYear: currentYear,
        lastRefreshedAt: Date.now(),
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
}));
