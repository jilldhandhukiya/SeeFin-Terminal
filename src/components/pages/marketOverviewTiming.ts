export type MarketPhase = 'HOLIDAY' | 'BREAK' | 'AUCTION' | 'OPEN' | 'PRE' | 'POST' | 'CLOSED';

export type MarketSessionPhase = Exclude<MarketPhase, 'HOLIDAY' | 'CLOSED'>;

export type MarketSession = {
  phase?: MarketSessionPhase;
  type?: Lowercase<MarketSessionPhase>;
  label?: string;
  start_local: string;
  end_local: string;
};

export type MarketHolidayEntry = string | {
  date?: string;
  name?: string;
  description?: string;
};

export type MarketTimingRecord = {
  market_id: string;
  country: string;
  exchange: string;
  region?: string;
  timezone: {
    iana: string;
    label?: string;
  };
  trading_days: string[];
  sessions: MarketSession[];
  holidays?: MarketHolidayEntry[];
  holiday_calendar?: MarketHolidayEntry[] | { holidays?: MarketHolidayEntry[]; dates?: MarketHolidayEntry[] };
  holiday_dates?: MarketHolidayEntry[];
  notes?: string[];
};

export type CountryMarketSummary = {
  country: string;
  exchangeCount: number;
  exchanges: string[];
  activeRecord: MarketTimingRecord;
  activePhase: MarketPhase;
  phaseLabel: string;
  phaseColor: string;
  nextChangeLabel: string;
  activeWindowLabel: string;
  localTimeLabel: string;
  currentSessionLabel: string;
};

type ZonedDateParts = {
  dateIso: string;
  weekday: string;
  minuteOfDay: number;
  hour: number;
  minute: number;
  year: number;
  month: number;
  day: number;
};

type EvaluatedMarketRecord = {
  record: MarketTimingRecord;
  phase: MarketPhase;
  nextChangeLabel: string;
  nextChangeTime: number | null;
  activeWindowLabel: string;
  localTimeLabel: string;
  currentSessionLabel: string;
};

export const MARKET_PHASE_STYLES: Record<MarketPhase, { label: string; fillId: string; stroke: string; text: string; ring: string; shadow: string }> = {
  HOLIDAY: { label: 'Holiday', fillId: 'holidayFill', stroke: '#eab308', text: 'text-yellow-300', ring: 'ring-yellow-500/30', shadow: 'rgba(234, 179, 8, 0.35)' },
  BREAK: { label: 'Session break', fillId: 'breakFill', stroke: '#22d3ee', text: 'text-cyan-300', ring: 'ring-cyan-500/30', shadow: 'rgba(34, 211, 238, 0.28)' },
  AUCTION: { label: 'Auction', fillId: 'auctionFill', stroke: '#a855f7', text: 'text-fuchsia-300', ring: 'ring-fuchsia-500/30', shadow: 'rgba(168, 85, 247, 0.35)' },
  OPEN: { label: 'Open market', fillId: 'openFill', stroke: '#22c55e', text: 'text-emerald-400', ring: 'ring-emerald-500/30', shadow: 'rgba(34, 197, 94, 0.35)' },
  PRE: { label: 'Pre-market', fillId: 'preFill', stroke: '#f59e0b', text: 'text-amber-400', ring: 'ring-amber-500/30', shadow: 'rgba(245, 158, 11, 0.35)' },
  POST: { label: 'Post-market', fillId: 'postFill', stroke: '#f97316', text: 'text-orange-400', ring: 'ring-orange-500/30', shadow: 'rgba(249, 115, 22, 0.35)' },
  CLOSED: { label: 'Closed', fillId: 'closedFill', stroke: '#475569', text: 'text-slate-400', ring: 'ring-slate-500/20', shadow: 'rgba(71, 85, 105, 0.20)' },
};

const phasePriority: Record<MarketPhase, number> = {
  HOLIDAY: 6,
  BREAK: 5,
  AUCTION: 4,
  OPEN: 3,
  PRE: 2,
  POST: 1,
  CLOSED: 0,
};

const weekdayByIntlName: Record<string, string> = {
  Mon: 'MON',
  Tue: 'TUE',
  Wed: 'WED',
  Thu: 'THU',
  Fri: 'FRI',
  Sat: 'SAT',
  Sun: 'SUN',
};

const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();

const getDateTimeFormatter = (timeZone: string) => {
  const cached = dateTimeFormatters.get(timeZone);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  dateTimeFormatters.set(timeZone, formatter);
  return formatter;
};

const getZonedDateParts = (timeZone: string, utcTime: number): ZonedDateParts => {
  const parts = getDateTimeFormatter(timeZone).formatToParts(new Date(utcTime));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const hour = Number(values.hour === '24' ? '0' : values.hour);
  const minute = Number(values.minute);
  const year = Number(values.year);
  const month = Number(values.month);
  const day = Number(values.day);

  return {
    dateIso: `${values.year}-${values.month}-${values.day}`,
    weekday: weekdayByIntlName[values.weekday] ?? values.weekday.toUpperCase(),
    minuteOfDay: hour * 60 + minute,
    hour,
    minute,
    year,
    month,
    day,
  };
};

const parseLocalMinute = (time: string) => {
  const [hour = '0', minute = '0'] = time.split(':');
  return Number(hour) * 60 + Number(minute);
};

const getSessionPhase = (session: MarketSession): MarketSessionPhase => {
  if (session.phase) {
    return session.phase;
  }

  return (session.type?.toUpperCase() ?? 'OPEN') as MarketSessionPhase;
};

const isWithinWindow = (minuteOfDay: number, startMinute: number, endMinute: number) => {
  if (startMinute === endMinute) {
    return false;
  }

  if (startMinute < endMinute) {
    return minuteOfDay >= startMinute && minuteOfDay < endMinute;
  }

  return minuteOfDay >= startMinute || minuteOfDay < endMinute;
};

const getHolidayEntries = (record: MarketTimingRecord) => {
  const calendar = record.holiday_calendar;
  const calendarEntries = Array.isArray(calendar) ? calendar : [...(calendar?.holidays ?? []), ...(calendar?.dates ?? [])];

  return [...(record.holidays ?? []), ...calendarEntries, ...(record.holiday_dates ?? [])];
};

const getHolidayDate = (holiday: MarketHolidayEntry) => {
  return typeof holiday === 'string' ? holiday : holiday.date;
};

const getHolidayLabel = (record: MarketTimingRecord, dateIso: string) => {
  const match = getHolidayEntries(record).find((holiday) => getHolidayDate(holiday) === dateIso);

  if (!match) {
    return null;
  }

  if (typeof match === 'string') {
    return 'Holiday';
  }

  return match.name ?? match.description ?? 'Holiday';
};

const isTradingDay = (record: MarketTimingRecord, weekday: string) => {
  return record.trading_days.map((day) => day.toUpperCase()).includes(weekday);
};

const formatCountdown = (targetTime: number, nowTime: number) => {
  const totalMinutes = Math.max(0, Math.ceil((targetTime - nowTime) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
};

const formatLocalClock = ({ hour, minute }: Pick<ZonedDateParts, 'hour' | 'minute'>) => {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const formatSessionLabel = (session: MarketSession) => {
  return `${session.label ?? MARKET_PHASE_STYLES[getSessionPhase(session)].label} ${session.start_local} - ${session.end_local}`;
};

const addDaysToLocalParts = (parts: ZonedDateParts, dayOffset: number) => {
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + dayOffset));

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    dateIso: date.toISOString().slice(0, 10),
  };
};

const getWeekdayForLocalDate = (timeZone: string, parts: ReturnType<typeof addDaysToLocalParts>) => {
  const middayUtc = Date.UTC(parts.year, parts.month - 1, parts.day, 12);
  return getZonedDateParts(timeZone, middayUtc).weekday;
};

const getUtcTimeForZonedLocal = (timeZone: string, dateParts: ReturnType<typeof addDaysToLocalParts>, minuteOfDay: number) => {
  const targetHour = Math.floor(minuteOfDay / 60);
  const targetMinute = minuteOfDay % 60;
  let utcTime = Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day, targetHour, targetMinute);

  for (let index = 0; index < 3; index += 1) {
    const actual = getZonedDateParts(timeZone, utcTime);
    const actualDate = Date.UTC(actual.year, actual.month - 1, actual.day);
    const targetDate = Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day);
    const dayDeltaMinutes = (actualDate - targetDate) / 60000;
    const minuteDelta = dayDeltaMinutes + actual.minuteOfDay - minuteOfDay;

    if (minuteDelta === 0) {
      break;
    }

    utcTime -= minuteDelta * 60000;
  }

  return utcTime;
};

const getNextChangeInfo = (record: MarketTimingRecord, nowTime: number, localParts: ZonedDateParts) => {
  const timeZone = record.timezone.iana;
  const candidates: { time: number; phase: MarketPhase; session: MarketSession }[] = [];

  for (let dayOffset = 0; dayOffset <= 8; dayOffset += 1) {
    const localDate = addDaysToLocalParts(localParts, dayOffset);
    const weekday = getWeekdayForLocalDate(timeZone, localDate);

    if (!isTradingDay(record, weekday) || getHolidayLabel(record, localDate.dateIso)) {
      continue;
    }

    record.sessions.forEach((session) => {
      const startMinute = parseLocalMinute(session.start_local);
      const endMinute = parseLocalMinute(session.end_local);
      const startTime = getUtcTimeForZonedLocal(timeZone, localDate, startMinute);
      const endDayOffset = endMinute <= startMinute ? dayOffset + 1 : dayOffset;
      const endDate = addDaysToLocalParts(localParts, endDayOffset);
      const endTime = getUtcTimeForZonedLocal(timeZone, endDate, endMinute);

      if (startTime > nowTime) {
        candidates.push({ time: startTime, phase: getSessionPhase(session), session });
      }

      if (endTime > nowTime) {
        candidates.push({ time: endTime, phase: 'CLOSED', session });
      }
    });
  }

  const next = candidates.sort((left, right) => {
    if (left.time !== right.time) {
      return left.time - right.time;
    }

    return phasePriority[right.phase] - phasePriority[left.phase];
  })[0];

  if (!next) {
    return { label: 'No upcoming transition', time: null };
  }

  const targetLabel = next.phase === 'CLOSED'
    ? `Ends ${next.session.label ?? MARKET_PHASE_STYLES[getSessionPhase(next.session)].label}`
    : MARKET_PHASE_STYLES[next.phase].label;

  return {
    label: `${targetLabel} in ${formatCountdown(next.time, nowTime)}`,
    time: next.time,
  };
};

const evaluateMarketRecord = (record: MarketTimingRecord, nowTime: number): EvaluatedMarketRecord => {
  const localParts = getZonedDateParts(record.timezone.iana, nowTime);
  const localTimeLabel = `${formatLocalClock(localParts)} ${record.timezone.label ?? record.timezone.iana}`;
  const holidayLabel = getHolidayLabel(record, localParts.dateIso);

  if (holidayLabel) {
    const nextChange = getNextChangeInfo(record, nowTime, localParts);

    return {
      record,
      phase: 'HOLIDAY',
      nextChangeLabel: nextChange.label,
      nextChangeTime: nextChange.time,
      activeWindowLabel: holidayLabel,
      localTimeLabel,
      currentSessionLabel: holidayLabel,
    };
  }

  if (!isTradingDay(record, localParts.weekday)) {
    const nextChange = getNextChangeInfo(record, nowTime, localParts);

    return {
      record,
      phase: 'CLOSED',
      nextChangeLabel: nextChange.label,
      nextChangeTime: nextChange.time,
      activeWindowLabel: 'Non-trading day',
      localTimeLabel,
      currentSessionLabel: 'Closed',
    };
  }

  const matchingSessions = record.sessions.filter((session) => {
    return isWithinWindow(localParts.minuteOfDay, parseLocalMinute(session.start_local), parseLocalMinute(session.end_local));
  });
  const activeSession = matchingSessions.sort((left, right) => {
    return phasePriority[getSessionPhase(right)] - phasePriority[getSessionPhase(left)];
  })[0];
  const phase = activeSession ? getSessionPhase(activeSession) : 'CLOSED';
  const nextChange = getNextChangeInfo(record, nowTime, localParts);

  return {
    record,
    phase,
    nextChangeLabel: nextChange.label,
    nextChangeTime: nextChange.time,
    activeWindowLabel: activeSession ? formatSessionLabel(activeSession) : 'Outside listed sessions',
    localTimeLabel,
    currentSessionLabel: activeSession ? (activeSession.label ?? MARKET_PHASE_STYLES[phase].label) : 'Closed',
  };
};

const selectPrimaryRecord = (records: EvaluatedMarketRecord[]) => {
  return [...records].sort((left, right) => {
    const priorityDelta = phasePriority[right.phase] - phasePriority[left.phase];

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    const leftTime = left.nextChangeTime ?? Number.POSITIVE_INFINITY;
    const rightTime = right.nextChangeTime ?? Number.POSITIVE_INFINITY;

    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    return left.record.exchange.localeCompare(right.record.exchange);
  })[0];
};

export const buildCountrySummaries = (records: MarketTimingRecord[], nowTime: number) => {
  const groupedRecords = new Map<string, EvaluatedMarketRecord[]>();

  records.forEach((record) => {
    const evaluatedRecord = evaluateMarketRecord(record, nowTime);
    const bucket = groupedRecords.get(record.country) ?? [];

    bucket.push(evaluatedRecord);
    groupedRecords.set(record.country, bucket);
  });

  const summaries = new Map<string, CountryMarketSummary>();

  groupedRecords.forEach((group, country) => {
    const primary = selectPrimaryRecord(group);

    if (!primary) {
      return;
    }

    const style = MARKET_PHASE_STYLES[primary.phase];

    summaries.set(country, {
      country,
      exchangeCount: group.length,
      exchanges: group.map(({ record }) => record.exchange),
      activeRecord: primary.record,
      activePhase: primary.phase,
      phaseLabel: style.label,
      phaseColor: style.stroke,
      nextChangeLabel: primary.nextChangeLabel,
      activeWindowLabel: primary.activeWindowLabel,
      localTimeLabel: primary.localTimeLabel,
      currentSessionLabel: primary.currentSessionLabel,
    });
  });

  return summaries;
};

export const MARKET_TIMING_URL = '/config/world_market_timing_normalized.json';
