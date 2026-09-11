'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import TerminalPanel from '@/components/ui/TerminalPanel';
import TerminalWorkspace from '@/components/layout/TerminalWorkspace';
import { CalendarDays, Clock3, Globe2, Landmark, LoaderCircle, MapPinned } from 'lucide-react';
import {
  MARKET_PHASE_STYLES,
  MARKET_TIMING_URL,
  buildCountrySummaries,
  type CountryMarketSummary,
  type MarketPhase,
  type MarketTimingRecord,
} from './marketOverviewTiming';
import { type MarketHolidayRecord } from './marketOverviewCalendarApi';
import { useMarketCalendarStore } from '@/state/marketCalendarStore';

type OverviewTab = 'WORLD_MAP' | 'CALENDRE';

type CalendarMonth = {
  year: number;
  month: number;
};

type CalendarDayCell = {
  date: Date;
  isoDate: string;
  inMonth: boolean;
  holidays: MarketHolidayRecord[];
};

type Position = [number, number];

type GeoJsonGeometry = {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: Position[][] | Position[][][];
};

type GeoJsonFeature = {
  type: 'Feature';
  properties: {
    name?: string;
    ADMIN?: string;
    sovereignt?: string;
    country?: string;
  };
  geometry: GeoJsonGeometry;
};

type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
};

type MarketTimingResponse = MarketTimingRecord[] | { markets: MarketTimingRecord[] };

type ProjectedFeature = {
  name: string;
  path: string;
  summary: CountryMarketSummary | null;
  centroid: Position | null;
};

const MAP_DATA_URL = 'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';

const GEOJSON_NAME_MAPPING: Record<string, string> = {
  USA: 'United States',
  'United States of America': 'United States',
  'United States': 'United States',
  England: 'United Kingdom',
  'Great Britain': 'United Kingdom',
  'Republic of Korea': 'South Korea',
  Korea: 'South Korea',
  'Taiwan, Province of China': 'Taiwan',
  'Viet Nam': 'Vietnam',
  Czechia: 'Czech Republic',
};

const ECONOMIC_EVENTS = [
  { time: '08:30', title: 'CPI Inflation Print', market: 'US', priority: 'HIGH' },
  { time: '11:00', title: 'ECB Policy Minutes', market: 'EU', priority: 'MED' },
  { time: '14:00', title: 'FII Flow Update', market: 'ASIA', priority: 'HIGH' },
  { time: '16:30', title: 'Earnings Call Cluster', market: 'GLOBAL', priority: 'LOW' },
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const getPhaseRank = (phase: MarketPhase) => {
  if (phase === 'HOLIDAY') {
    return 6;
  }

  if (phase === 'BREAK') {
    return 5;
  }

  if (phase === 'AUCTION') {
    return 4;
  }

  if (phase === 'OPEN') {
    return 3;
  }

  if (phase === 'PRE') {
    return 2;
  }

  if (phase === 'POST') {
    return 1;
  }

  return 0;
};

const createMonthAnchor = (date = new Date()): CalendarMonth => ({
  year: date.getFullYear(),
  month: date.getMonth(),
});

const getMonthTitle = ({ year, month }: CalendarMonth) => `${MONTH_LABELS[month]} ${year}`;

const getCalendarWeeks = ({ year, month }: CalendarMonth) => {
  const firstOfMonth = new Date(year, month, 1);
  const startDay = (firstOfMonth.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - startDay);
  const cells: Date[] = [];

  for (let index = 0; index < 42; index += 1) {
    cells.push(new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + index));
  }

  return cells;
};

const getHolidayTypeLabel = (holidayType: MarketHolidayRecord['holiday_type']) => {
  if (holidayType === 'SETTLEMENT_HOLIDAY') {
    return 'Settlement';
  }

  if (holidayType === 'SPECIAL_TIMING') {
    return 'Special timing';
  }

  return 'Trading holiday';
};

const getHolidayTypeTone = (holidayType: MarketHolidayRecord['holiday_type']) => {
  if (holidayType === 'SETTLEMENT_HOLIDAY') {
    return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30';
  }

  if (holidayType === 'SPECIAL_TIMING') {
    return 'text-fuchsia-400 border-fuchsia-500/40 bg-fuchsia-950/30';
  }

  return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
};

const MarketOverview = () => {
  const [activeTab, setActiveTab] = useState<OverviewTab>('WORLD_MAP');
  const [geoData, setGeoData] = useState<GeoJsonFeatureCollection | null>(null);
  const [marketTimings, setMarketTimings] = useState<MarketTimingRecord[]>([]);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [isLoadingTimings, setIsLoadingTimings] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [timingError, setTimingError] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<CountryMarketSummary | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [calendarMonth, setCalendarMonth] = useState<CalendarMonth>(() => createMonthAnchor());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => formatIsoDate(new Date()));
  const holidayDetailsByDate = useMarketCalendarStore((state) => state.holidayDetailsByDate);
  const holidayError = useMarketCalendarStore((state) => state.holidayError);
  const isLoadingHolidays = useMarketCalendarStore((state) => state.isLoadingHolidays);
  const loadHolidayIndex = useMarketCalendarStore((state) => state.loadHolidayIndex);
  const refreshHolidayIndex = useMarketCalendarStore((state) => state.refreshHolidayIndex);
  const getHolidayDetailsForDate = useMarketCalendarStore((state) => state.getHolidayDetailsForDate);

  useEffect(() => {
    const syncClock = () => setCurrentTime(Date.now());

    syncClock();
    const intervalId = window.setInterval(syncClock, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadMap = async () => {
      try {
        setIsLoadingMap(true);
        setMapError(null);

        const response = await fetch(MAP_DATA_URL);
        if (!response.ok) {
          throw new Error(`Map data request failed (${response.status})`);
        }

        const data = (await response.json()) as GeoJsonFeatureCollection;
        if (!isCancelled) {
          setGeoData(data);
        }
      } catch (error) {
        if (!isCancelled) {
          setMapError(error instanceof Error ? error.message : 'Unable to load world map.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMap(false);
        }
      }
    };

    loadMap();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    void loadHolidayIndex();
  }, [loadHolidayIndex]);

  useEffect(() => {
    let isCancelled = false;

    const loadTimings = async () => {
      try {
        setIsLoadingTimings(true);
        setTimingError(null);

        const response = await fetch(MARKET_TIMING_URL);
        if (!response.ok) {
          throw new Error(`Timing data request failed (${response.status})`);
        }

        const data = (await response.json()) as MarketTimingResponse;
        const records = Array.isArray(data) ? data : data.markets;

        if (!Array.isArray(records)) {
          throw new Error('Timing data response did not include a markets array.');
        }

        if (!isCancelled) {
          setMarketTimings(records);
        }
      } catch (error) {
        if (!isCancelled) {
          setTimingError(error instanceof Error ? error.message : 'Unable to load world market timings.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingTimings(false);
        }
      }
    };

    loadTimings();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const updateSize = () => {
      const element = mapContainerRef.current;
      if (!element) {
        return;
      }

      setMapSize({
        width: element.clientWidth,
        height: Math.max(element.clientHeight, 560),
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, [activeTab]);

  const countrySummaries = useMemo(() => buildCountrySummaries(marketTimings, currentTime), [currentTime, marketTimings]);

  const timingStats = useMemo(() => {
    const counts: Record<MarketPhase, number> = {
      HOLIDAY: 0,
      BREAK: 0,
      AUCTION: 0,
      PRE: 0,
      OPEN: 0,
      POST: 0,
      CLOSED: 0,
    };

    countrySummaries.forEach((summary) => {
      counts[summary.activePhase] += 1;
    });

    return counts;
  }, [countrySummaries]);

  const trackedMarkets = useMemo(() => {
    return Array.from(countrySummaries.values()).sort((left, right) => {
      const phaseDelta = getPhaseRank(right.activePhase) - getPhaseRank(left.activePhase);

      if (phaseDelta !== 0) {
        return phaseDelta;
      }

      return left.country.localeCompare(right.country);
    });
  }, [countrySummaries]);

  const currentMachineTimeLabel = useMemo(() => {
    const dt = new Date(currentTime);
    const time = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const date = dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const day = dt.toLocaleDateString('en-US', { weekday: 'long' });

    return `${time} - ${date} - ${day}`;
  }, [currentTime]);

  const defaultMarket = useMemo(() => {
    return trackedMarkets[0] ?? null;
  }, [trackedMarkets]);

  const projectedFeatures = useMemo<ProjectedFeature[]>(() => {
    if (!geoData || mapSize.width === 0 || mapSize.height === 0) {
      return [];
    }

    const extractPolygons = (geometry: GeoJsonGeometry): Position[][][] => (
      geometry.type === 'Polygon'
        ? [geometry.coordinates as Position[][]]
        : (geometry.coordinates as Position[][][])
    );

    const allPoints: [number, number][] = [];

    geoData.features.forEach((feature) => {
      extractPolygons(feature.geometry).forEach((polygon) => {
        polygon.forEach((ring) => {
          ring.forEach((point) => {
            const [longitude, latitude] = point;
            allPoints.push([longitude, latitude]);
          });
        });
      });
    });

    if (!allPoints.length) {
      return [];
    }

    const longitudes = allPoints.map(([longitude]) => longitude);
    const latitudes = allPoints.map(([, latitude]) => latitude);
    const minLongitude = Math.min(...longitudes);
    const maxLongitude = Math.max(...longitudes);
    const minLatitude = Math.min(...latitudes);
    const maxLatitude = Math.max(...latitudes);

    const padding = 32;
    const availableWidth = mapSize.width - padding * 2;
    const availableHeight = mapSize.height - padding * 2;
    const widthScale = availableWidth / (maxLongitude - minLongitude || 1);
    const heightScale = availableHeight / (maxLatitude - minLatitude || 1);
    const scale = Math.min(widthScale, heightScale);

    const project = (longitude: number, latitude: number) => {
      const x = (longitude - minLongitude) * scale + padding;
      const y = (maxLatitude - latitude) * scale + padding;
      return [x, y] as const;
    };

    const projectedFeatures: ProjectedFeature[] = [];

    geoData.features.forEach((feature) => {
      const featurePoints: [number, number][] = [];

      extractPolygons(feature.geometry).forEach((polygon) => {
        polygon.forEach((ring) => {
          ring.forEach((point) => {
            const [longitude, latitude] = point;
            featurePoints.push([longitude, latitude]);
          });
        });
      });

      if (!featurePoints.length) {
        return;
      }

      const buildPath = (targetFeature: GeoJsonFeature) => {
        const polygons = extractPolygons(targetFeature.geometry);

        return polygons
          .map((polygon) => polygon
            .map((ring) => ring
              .map((point, index) => {
                const [longitude, latitude] = point;
                const [x, y] = project(longitude, latitude);
                return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
              })
              .join(' ') + ' Z')
            .join(' '))
          .join(' ');
      };

      const rawName = feature.properties.name ?? feature.properties.ADMIN ?? feature.properties.sovereignt ?? feature.properties.country ?? 'Unknown';
      const canonicalName = GEOJSON_NAME_MAPPING[rawName] ?? rawName;
      const featureLongitudes = featurePoints.map(([longitude]) => longitude);
      const featureLatitudes = featurePoints.map(([, latitude]) => latitude);
      const centerLongitude = (Math.min(...featureLongitudes) + Math.max(...featureLongitudes)) / 2;
      const centerLatitude = (Math.min(...featureLatitudes) + Math.max(...featureLatitudes)) / 2;

      projectedFeatures.push({
        name: canonicalName,
        path: buildPath(feature),
        summary: countrySummaries.get(canonicalName) ?? null,
        centroid: project(centerLongitude, centerLatitude) as Position,
      });
    });

    return projectedFeatures;
  }, [countrySummaries, geoData, mapSize.height, mapSize.width]);

  const phaseCards = [
    { phase: 'HOLIDAY' as const, value: timingStats.HOLIDAY, caption: 'Holiday closures' },
    { phase: 'BREAK' as const, value: timingStats.BREAK, caption: 'Session pauses in progress' },
    { phase: 'AUCTION' as const, value: timingStats.AUCTION, caption: 'Auction windows' },
    { phase: 'OPEN' as const, value: timingStats.OPEN, caption: 'Markets trading now' },
    { phase: 'PRE' as const, value: timingStats.PRE, caption: 'Pre-open windows' },
    { phase: 'POST' as const, value: timingStats.POST, caption: 'After-hours windows' },
    { phase: 'CLOSED' as const, value: timingStats.CLOSED, caption: 'Closed for now' },
  ];

  const hoveredMarket = selectedMarket ?? defaultMarket;
  const marketLoading = isLoadingMap || isLoadingTimings;
  const errorMessage = mapError ?? timingError;
  const calendarLoading = isLoadingHolidays;
  const calendarError = holidayError;

  const calendarCells = useMemo<CalendarDayCell[]>(() => {
    return getCalendarWeeks(calendarMonth).map((date) => {
      const isoDate = formatIsoDate(date);

      return {
        date,
        isoDate,
        inMonth: date.getMonth() === calendarMonth.month,
        holidays: holidayDetailsByDate[isoDate] ?? [],
      };
    });
  }, [calendarMonth, holidayDetailsByDate]);

  const selectedHolidayDetails = getHolidayDetailsForDate(selectedCalendarDate);

  const selectedCalendarDateLabel = useMemo(() => {
    const [year, month, day] = selectedCalendarDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedCalendarDate]);

  const loadHolidayDetails = (date: string) => {
    setSelectedCalendarDate(date);
  };

  const moveCalendarMonth = (offset: number) => {
    setCalendarMonth((current) => {
      const nextDate = new Date(current.year, current.month + offset, 1);
      const nextAnchor = { year: nextDate.getFullYear(), month: nextDate.getMonth() };

      setSelectedCalendarDate((previous) => {
        const [year, month, day] = previous.split('-').map(Number);
        const previousDate = new Date(year, month - 1, day);

        if (previousDate.getFullYear() === nextAnchor.year && previousDate.getMonth() === nextAnchor.month) {
          return previous;
        }

        return formatIsoDate(new Date(nextAnchor.year, nextAnchor.month, 1));
      });

      return nextAnchor;
    });
  };

  const worldMapTab = (
    <div className="w-full flex flex-col gap-4 bg-black p-4 md:p-6">
      <section className="rounded border border-gray-800 bg-gray-950/30 p-4 md:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-500 font-mono text-[10px] uppercase tracking-[0.35em]">
              <Globe2 size={12} />
              Real-time world market map
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Global markets</h2>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">
              <span suppressHydrationWarning className="border border-gray-800 bg-black px-2 py-1 text-gray-300">{currentMachineTimeLabel}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 w-full xl:w-auto">
            {phaseCards.map((card) => {
              const style = MARKET_PHASE_STYLES[card.phase];

              return (
                <div key={card.phase} className={`min-w-0 border border-gray-800 bg-black px-3 py-2 ${style.ring}`}>
                  <div className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">{style.label}</div>
                  <div className={`mt-1 text-lg font-bold tracking-tight ${style.text}`}>{card.value}</div>
                  <div className="mt-1 text-[10px] text-gray-600 font-mono">{card.caption}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-4 items-start">
        <aside className="space-y-4 min-h-0">
          <section className="border border-gray-800 bg-gray-950/60 p-4">
            <div className="flex items-center gap-2 text-amber-500 font-mono text-[10px] uppercase tracking-[0.3em]">
              <MapPinned size={12} />
              Market context
            </div>

            {hoveredMarket ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xl font-bold text-white tracking-tight">{hoveredMarket.country}</div>
                    <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">
                      {hoveredMarket.activeRecord.exchange} · {hoveredMarket.exchangeCount} exchange{hoveredMarket.exchangeCount === 1 ? '' : 's'}
                    </div>
                  </div>
                  <div
                    className="text-[10px] font-mono uppercase tracking-[0.3em]"
                    style={{ color: hoveredMarket.phaseColor }}
                  >
                    {hoveredMarket.phaseLabel}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono uppercase tracking-widest">
                  <div className="border border-gray-800 bg-black px-3 py-2 text-gray-400">
                    Time zone
                    <div className="mt-1 text-gray-100 tracking-normal normal-case">{hoveredMarket.activeRecord.timezone.iana}</div>
                  </div>
                  <div className="border border-gray-800 bg-black px-3 py-2 text-gray-400">
                    Local time
                    <div className="mt-1 text-gray-100 tracking-normal normal-case">{hoveredMarket.localTimeLabel}</div>
                  </div>
                  <div className="border border-gray-800 bg-black px-3 py-2 text-gray-400">
                    Current status
                    <div className="mt-1 text-gray-100 tracking-normal normal-case">{hoveredMarket.phaseLabel}</div>
                  </div>
                  <div className="border border-gray-800 bg-black px-3 py-2 text-gray-400">
                    Current session
                    <div className="mt-1 text-gray-100 tracking-normal normal-case">{hoveredMarket.currentSessionLabel}</div>
                  </div>
                  <div className="border border-gray-800 bg-black px-3 py-2 text-gray-400">
                    Session window
                    <div className="mt-1 text-gray-100 tracking-normal normal-case">{hoveredMarket.activeWindowLabel}</div>
                  </div>
                  <div className="border border-gray-800 bg-black px-3 py-2 text-gray-400">
                    Next transition
                    <div className="mt-1 text-gray-100 tracking-normal normal-case">{hoveredMarket.nextChangeLabel}</div>
                  </div>
                </div>

                <div className="border border-gray-800 bg-black p-3">
                  <div className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">Exchanges</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {hoveredMarket.exchanges.map((exchange: string) => (
                      <span key={exchange} className="border border-gray-800 bg-gray-950/80 px-2 py-1 text-[10px] font-mono text-gray-300">
                        {exchange}
                      </span>
                    ))}
                  </div>
                </div>

                {hoveredMarket.activeRecord.notes?.length ? (
                  <p className="text-xs text-gray-500 font-mono leading-relaxed">{hoveredMarket.activeRecord.notes.join(' ')}</p>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-xs text-gray-500 font-mono leading-relaxed">
                Hover a tracked country to inspect its local market window, phase color, and next timing change.
              </p>
            )}
          </section>

          <section className="border border-gray-800 bg-gray-950/60 p-4">
            <div className="flex items-center gap-2 text-amber-500 font-mono text-[10px] uppercase tracking-[0.3em]">
              <Clock3 size={12} />
              Live session pulse
            </div>

            <div className="mt-4 space-y-2">
              {(trackedMarkets.slice(0, 5).length ? trackedMarkets.slice(0, 5) : trackedMarkets).map((summary) => {
                const style = MARKET_PHASE_STYLES[summary.activePhase];

                return (
                  <button
                    key={summary.country}
                    type="button"
                    onClick={() => setSelectedMarket(summary)}
                    className="w-full border border-gray-800 bg-black px-3 py-2 text-left transition-colors hover:border-gray-600 hover:bg-gray-900/80"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-white">{summary.country}</div>
                        <div className="mt-0.5 truncate text-[9px] font-mono uppercase tracking-[0.24em] text-gray-500">
                          {summary.activeRecord.exchange}
                        </div>
                      </div>
                      <div className={`text-[10px] font-mono uppercase tracking-[0.24em] ${style.text}`}>
                        {summary.phaseLabel}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-[9px] font-mono uppercase tracking-[0.24em] text-gray-500">
                      <span className="truncate">{summary.activeWindowLabel}</span>
                      <span className="shrink-0">{summary.nextChangeLabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </aside>

        <section className="flex flex-col overflow-hidden rounded border border-gray-800 bg-gray-950/40">
          <div className="flex items-center justify-between gap-3 border-b border-gray-800 px-4 py-3">
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">Map overlay</div>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2 overflow-x-auto custom-scrollbar">
              <div className="shrink-0 text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">
                Hover or pin a live market
              </div>
              {(trackedMarkets.slice(0, 4).length ? trackedMarkets.slice(0, 4) : trackedMarkets).map((summary) => {
                const style = MARKET_PHASE_STYLES[summary.activePhase];

                return (
                  <button
                    key={summary.country}
                    type="button"
                    onClick={() => setSelectedMarket(summary)}
                    className="shrink-0 border border-gray-800 bg-black px-2 py-1 text-left text-[9px] font-mono uppercase tracking-[0.24em] text-gray-400 transition-colors hover:border-gray-600 hover:bg-gray-900"
                    style={{ boxShadow: `inset 0 0 0 1px ${style.shadow}` }}
                  >
                    <span className={style.text}>{summary.country}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <div ref={mapContainerRef} className="relative min-w-[900px] h-[580px] w-full">
              {marketLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-500">
                  <LoaderCircle className="animate-spin text-amber-500" size={24} />
                  <span className="font-mono text-sm">Loading world geojson and market timings...</span>
                </div>
              ) : errorMessage ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-red-400 px-6 text-center">
                  <span className="font-mono text-sm">{errorMessage}</span>
                  <span className="font-mono text-[10px] text-gray-500">The page is wired to the provided world.geojson and normalized market timing rules.</span>
                </div>
              ) : (
                <svg
                  viewBox={`0 0 ${Math.max(mapSize.width, 900)} ${Math.max(mapSize.height, 560)}`}
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <radialGradient id="activeGlow" cx="50%" cy="50%" r="75%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="preFill" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.92" />
                      <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.82" />
                    </linearGradient>
                    <linearGradient id="holidayFill" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#eab308" stopOpacity="0.92" />
                      <stop offset="100%" stopColor="#facc15" stopOpacity="0.74" />
                    </linearGradient>
                    <linearGradient id="openFill" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#16a34a" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.82" />
                    </linearGradient>
                    <linearGradient id="breakFill" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.78" />
                    </linearGradient>
                    <linearGradient id="auctionFill" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.92" />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity="0.76" />
                    </linearGradient>
                    <linearGradient id="postFill" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.94" />
                      <stop offset="100%" stopColor="#fb7185" stopOpacity="0.8" />
                    </linearGradient>
                    <linearGradient id="closedFill" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1f2937" stopOpacity="0.95" />
                      <stop offset="100%" stopColor="#111827" stopOpacity="0.95" />
                    </linearGradient>
                  </defs>

                  <rect x="0" y="0" width="100%" height="100%" fill="url(#activeGlow)" opacity="0.35" />

                  {projectedFeatures.map((feature, index) => {
                    const summary = feature.summary;
                    const phase = summary?.activePhase ?? 'CLOSED';
                    const style = MARKET_PHASE_STYLES[phase];
                    const fill = summary ? `url(#${style.fillId})` : 'url(#closedFill)';
                    const stroke = summary ? style.stroke : '#334155';

                    return (
                      <path
                        key={`${feature.name}-${index}`}
                        d={feature.path}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={1}
                        className={`transition-all duration-200 ${summary ? 'cursor-pointer hover:opacity-90' : 'opacity-70'}`}
                        style={{ filter: summary ? `drop-shadow(0 0 12px ${style.shadow})` : undefined }}
                        onMouseEnter={() => setSelectedMarket(summary)}
                        onMouseLeave={() => setSelectedMarket(null)}
                      >
                        <title>
                          {summary
                            ? `${summary.country}\n${summary.activeRecord.exchange}\nLocal time: ${summary.localTimeLabel}\nCurrent status: ${summary.phaseLabel}\nCurrent session: ${summary.currentSessionLabel}\nNext transition: ${summary.nextChangeLabel}`
                            : `${feature.name}\nCurrent status: Closed`}
                        </title>
                      </path>
                    );
                  })}

                  {projectedFeatures.map((feature, index) => {
                    const summary = feature.summary;

                    if (!summary || !feature.centroid) {
                      return null;
                    }

                    const style = MARKET_PHASE_STYLES[summary.activePhase];
                    const isLive = summary.activePhase === 'OPEN' || summary.activePhase === 'BREAK';

                    return (
                      <g
                        key={`marker-${feature.name}-${index}`}
                        transform={`translate(${feature.centroid[0]}, ${feature.centroid[1]})`}
                        className="pointer-events-none"
                      >
                        <circle
                          r={isLive ? 8 : 5}
                          fill={style.stroke}
                          fillOpacity={isLive ? 0.92 : 0.72}
                          stroke="#020617"
                          strokeWidth={1.2}
                          className={isLive ? 'animate-pulse' : ''}
                        />
                        {isLive ? (
                          <circle
                            r={13}
                            fill="none"
                            stroke={style.stroke}
                            strokeOpacity={0.28}
                            strokeWidth={1}
                            strokeDasharray="2 4"
                          />
                        ) : null}
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  const calendarTab = (
    <div className="w-full grid grid-cols-1 xl:grid-cols-12 bg-black">
      <div className="xl:col-span-9 bg-black p-4 md:p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-500 font-mono text-[10px] uppercase tracking-[0.35em]">
              <CalendarDays size={12} />
              Market calendar
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Holiday-aware schedule</h2>
            <p className="max-w-2xl text-xs md:text-sm text-gray-500 font-mono leading-relaxed">
              Switch months, inspect day-level market holidays, and keep future APIs grouped under the same calendar feature.
            </p>
          </div>

          <div className="flex items-center gap-2 border border-gray-800 bg-gray-950/50 p-1 self-start">
            <button
              type="button"
              onClick={() => moveCalendarMonth(-1)}
              className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-gray-400 hover:text-white hover:bg-gray-900"
            >
              Prev
            </button>
            <div className="min-w-[160px] px-3 py-1 text-center text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500">
              {getMonthTitle(calendarMonth)}
            </div>
            <button
              type="button"
              onClick={() => moveCalendarMonth(1)}
              className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-gray-400 hover:text-white hover:bg-gray-900"
            >
              Next
            </button>
            <button
              type="button"
              onClick={() => void refreshHolidayIndex()}
              className="px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-amber-400 hover:text-black hover:bg-amber-500"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="text-[9px] font-mono uppercase tracking-widest text-gray-500 text-center py-2 border border-gray-800 bg-gray-950/50">
              {day}
            </div>
          ))}

          {calendarCells.map((cell) => {
            const isSelected = cell.isoDate === selectedCalendarDate;
            const hasHoliday = cell.holidays.length > 0;
            const primaryHoliday = cell.holidays[0] ?? null;

            return (
              <button
                key={cell.isoDate}
                type="button"
                onClick={() => {
                  void loadHolidayDetails(cell.isoDate);
                }}
                className={`group min-h-[118px] border p-2 text-left text-[10px] font-mono transition-all ${cell.inMonth ? 'border-gray-800 bg-black' : 'border-gray-900 bg-gray-950/40 text-gray-700'} ${hasHoliday ? 'ring-1 ring-amber-500/20' : ''} ${isSelected ? 'border-amber-500/70 bg-amber-950/20 shadow-[0_0_0_1px_rgba(245,158,11,0.2)]' : 'hover:border-gray-600 hover:bg-gray-900/70'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className={`text-sm font-semibold ${cell.inMonth ? 'text-white' : 'text-gray-700'}`}>
                    {cell.date.getDate()}
                  </div>
                  {hasHoliday ? <Clock3 size={10} className="mt-0.5 shrink-0 text-amber-500" /> : null}
                </div>

                <div className="mt-2 space-y-2 min-h-0">
                  {primaryHoliday ? (
                    <div className={`inline-flex max-w-full items-center rounded border px-2 py-1 text-[9px] uppercase tracking-[0.24em] ${getHolidayTypeTone(primaryHoliday.holiday_type)}`}>
                      <span className="truncate">{primaryHoliday.description}</span>
                    </div>
                  ) : (
                    <div className="text-[9px] uppercase tracking-[0.24em] text-gray-700">No holiday</div>
                  )}

                  <div className="space-y-1 text-[9px] leading-snug text-gray-500">
                    {cell.holidays.slice(0, 2).map((holiday) => (
                      <div key={`${cell.isoDate}-${holiday.description}`} className="truncate">
                        {getHolidayTypeLabel(holiday.holiday_type)} · {holiday.description}
                      </div>
                    ))}
                    {cell.holidays.length > 2 ? <div className="text-gray-600">+{cell.holidays.length - 2} more</div> : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="xl:col-span-3 bg-black p-4 md:p-5 flex flex-col gap-4 border-t xl:border-t-0 xl:border-l border-gray-800">
        <div className="flex items-center gap-2 text-amber-500 font-mono text-[10px] uppercase tracking-[0.35em]">
          <Landmark size={12} />
          Day details
        </div>

        <div className="border border-gray-800 bg-gray-950/60 p-4 space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">Selected day</div>
          <div suppressHydrationWarning className="text-sm font-semibold text-white leading-tight">{selectedCalendarDateLabel}</div>
          <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-gray-500">
            {selectedHolidayDetails.length ? `${selectedHolidayDetails.length} holiday${selectedHolidayDetails.length === 1 ? '' : 's'}` : 'No holiday on this date'}
          </div>

          {calendarLoading ? (
            <div className="text-xs font-mono text-gray-500">Loading holidays...</div>
          ) : calendarError ? (
            <div className="text-xs font-mono text-red-400">{calendarError}</div>
          ) : selectedHolidayDetails[0] ? (
            <div className="space-y-2">
              <div className={`inline-flex rounded border px-2 py-1 text-[9px] font-mono uppercase tracking-[0.28em] ${getHolidayTypeTone(selectedHolidayDetails[0].holiday_type)}`}>
                {selectedHolidayDetails[0].holiday_type}
              </div>
              <div className="text-xs text-gray-300 font-mono leading-relaxed">{selectedHolidayDetails[0].description}</div>
              <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-gray-500">
                Closed exchanges
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedHolidayDetails[0].closed_exchanges.length ? selectedHolidayDetails[0].closed_exchanges.map((exchange) => (
                  <span key={`${selectedHolidayDetails[0].date}-${exchange}`} className="border border-gray-800 bg-black px-2 py-1 text-[10px] font-mono text-gray-300">
                    {exchange}
                  </span>
                )) : <span className="text-xs text-gray-500 font-mono">No closed exchanges reported.</span>}
              </div>
              {selectedHolidayDetails[0].open_exchanges.length ? (
                <div className="space-y-2 pt-2">
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-gray-500">Open exchanges</div>
                  <div className="space-y-2">
                    {selectedHolidayDetails[0].open_exchanges.map((window) => (
                      <div key={`${selectedHolidayDetails[0].date}-${window.exchange}`} className="border border-gray-800 bg-black px-2 py-2 text-[10px] font-mono text-gray-300">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-white">{window.exchange}</span>
                          <span className="text-gray-500">Open window</span>
                        </div>
                        <div suppressHydrationWarning className="mt-1 text-gray-500 normal-case tracking-normal">
                          {new Date(window.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {new Date(window.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-xs text-gray-500 font-mono leading-relaxed">
              Click a day to inspect the holiday API response and exchange windows.
            </div>
          )}
        </div>

        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1">
          {ECONOMIC_EVENTS.map((event) => (
            <div key={event.title} className="border border-gray-800 bg-gray-950/60 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-mono text-white uppercase truncate">{event.title}</div>
                  <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.24em] text-gray-500">{event.market}</div>
                </div>
                <div className={`text-[10px] font-mono ${event.priority === 'HIGH' ? 'text-red-500' : event.priority === 'MED' ? 'text-amber-500' : 'text-green-500'}`}>{event.priority}</div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-gray-500">
                <span>{event.time}</span>
                <span>Event</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto border border-gray-800 bg-gray-950/60 p-3">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500">
            <Clock3 size={12} />
            Session guide
          </div>
          <p className="mt-3 text-xs text-gray-500 font-mono leading-relaxed">
            Use the calendar to compare trading holidays with your event stack before you place the trade.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <TerminalWorkspace>
      <div className="flex flex-col min-h-full w-full flex-1">
        <TerminalPanel
          title="WORLD_MARKET_TIMING"
          className="min-h-full flex-1"
          bodyClassName="overflow-visible"
          actions={
            <div className="flex items-center gap-1 border border-gray-800 bg-black p-1 overflow-x-auto custom-scrollbar">
              {(['WORLD_MAP', 'CALENDRE'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-[9px] font-mono uppercase tracking-widest transition-colors whitespace-nowrap cursor-pointer ${activeTab === tab ? 'bg-amber-600 text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}
                >
                  {tab === 'WORLD_MAP' ? 'World Map' : 'Calendre'}
                </button>
              ))}
            </div>
          }
        >
          {activeTab === 'WORLD_MAP' ? worldMapTab : calendarTab}
        </TerminalPanel>
      </div>
    </TerminalWorkspace>
  );
};

export default MarketOverview;
