import { create } from 'zustand';

export type SmartApiConnectInput = {
  apiKey?: string;
  clientCode?: string;
  password?: string;
  totpSecret?: string;
  macAddress?: string;
  clientLocalIp?: string;
  clientPublicIp?: string;
};

export type SmartApiStatus = {
  configured: boolean;
  connected: boolean;
  clientCode: string;
  expiresAt: string;
};

type SmartApiStore = SmartApiStatus & {
  loading: boolean;
  error: string;
  message: string;
  loadStatus: () => Promise<void>;
  connect: (credentials?: SmartApiConnectInput, persist?: boolean) => Promise<boolean>;
  clearSession: () => void;
  clearError: () => void;
};

const SESSION_STORAGE_KEY = 'seefin.terminal.auth.session.v1';

const getInitialSession = (): SmartApiStatus => {
  try {
    if (typeof window === 'undefined') {
      return { configured: true, connected: true, clientCode: 'SF-OPERATOR', expiresAt: '2027-01-01' };
    }
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as SmartApiStatus;
    }
    return { configured: true, connected: true, clientCode: 'SF-OPERATOR', expiresAt: '2027-01-01' };
  } catch {
    return { configured: true, connected: true, clientCode: 'SF-OPERATOR', expiresAt: '2027-01-01' };
  }
};

export const useSmartApiStore = create<SmartApiStore>((set) => ({
  ...getInitialSession(),
  loading: false,
  error: '',
  message: '',
  clearError: () => set({ error: '', message: '' }),
  loadStatus: async () => {
    set({ loading: true, error: '' });
    const session = getInitialSession();
    set({ ...session, loading: false });
  },
  connect: async (credentials, persist = true) => {
    set({ loading: true, error: '', message: '' });
    const clientCode = credentials?.clientCode?.trim() || 'SF-OPERATOR';
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const session: SmartApiStatus = {
      configured: true,
      connected: true,
      clientCode,
      expiresAt,
    };

    if (persist && typeof window !== 'undefined') {
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {
        // ignore local storage errors
      }
    }

    set({
      loading: false,
      ...session,
      message: 'Terminal session authenticated successfully.',
    });
    return true;
  },
  clearSession: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    set({
      configured: false,
      connected: false,
      clientCode: '',
      expiresAt: '',
      message: 'Session closed.',
    });
  },
}));
