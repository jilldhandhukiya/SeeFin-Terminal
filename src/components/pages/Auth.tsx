'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TerminalPanel from '@/components/ui/TerminalPanel';
import TerminalWorkspace from '@/components/layout/TerminalWorkspace';
import CmdInput from '@/components/ui/CmdInput';
import { AUTH_CONNECTORS, type ConnectorField } from '@/config/integrations';
import { useSmartApiStore } from '@/state/smartApiStore';
import { ArrowRight, CheckCircle2, Lock, RefreshCcw, ShieldCheck } from 'lucide-react';

const emptyDraft = (fields: ConnectorField[]) =>
  fields.reduce<Record<string, string>>((accumulator, field) => {
    accumulator[field.key] = '';
    return accumulator;
  }, {});

const Auth = () => {
  const router = useRouter();
  const [activeConnectorId, setActiveConnectorId] = useState(AUTH_CONNECTORS[0].id);
  const [rememberVault, setRememberVault] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({
    [AUTH_CONNECTORS[0].id]: emptyDraft(AUTH_CONNECTORS[0].fields),
  });
  const {
    connected,
    clientCode,
    expiresAt,
    loading,
    error,
    message,
    loadStatus,
    connect,
    clearError,
  } = useSmartApiStore();

  const activeConnector = AUTH_CONNECTORS.find((connector) => connector.id === activeConnectorId) ?? AUTH_CONNECTORS[0];
  const activeDraft = drafts[activeConnector.id] ?? emptyDraft(activeConnector.fields);
  const isSmartApi = activeConnector.id === 'smartapi';

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const updateField = (fieldKey: string, value: string) => {
    clearError();
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [activeConnector.id]: {
        ...(currentDrafts[activeConnector.id] ?? emptyDraft(activeConnector.fields)),
        [fieldKey]: value,
      },
    }));
  };

  const resetActiveDraft = () => {
    clearError();
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [activeConnector.id]: emptyDraft(activeConnector.fields),
    }));
  };

  const saveActiveDraft = async () => {
    if (!isSmartApi) {
      router.push('/');
      return;
    }

    const formCredentials = smartApiDraftComplete
      ? {
        apiKey: activeDraft.apiKey.trim(),
        clientCode: activeDraft.clientCode.trim(),
        password: activeDraft.password,
        totpSecret: activeDraft.totpSecret.trim(),
        macAddress: activeDraft.macAddress.trim(),
        clientLocalIp: activeDraft.clientLocalIp.trim(),
        clientPublicIp: activeDraft.clientPublicIp.trim(),
      }
      : undefined;
    const successful = await connect(formCredentials, rememberVault);
    if (successful) router.push('/');
  };

  const smartApiDraftComplete = ['apiKey', 'clientCode', 'password', 'totpSecret', 'macAddress', 'clientLocalIp', 'clientPublicIp']
    .every((field) => Boolean(activeDraft[field]?.trim()));
  const saveDisabled = loading;

  return (
    <TerminalWorkspace>
      <TerminalPanel title="AUTH_CONTROL_PLANE" className="min-h-full" bodyClassName="overflow-visible">
        <div className="flex min-h-full flex-col gap-6 p-4 md:p-6 lg:p-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.35em] text-amber-500">
              <Lock size={12} />
              Central auth vault
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {AUTH_CONNECTORS.map((connector) => {
                const isActive = connector.id === activeConnectorId;

                return (
                  <button
                    key={connector.id}
                    type="button"
                    onClick={() => setActiveConnectorId(connector.id)}
                    className={`flex items-center gap-3 border px-3 py-3 text-left transition-colors ${isActive ? 'border-amber-500 bg-amber-500/10' : 'border-gray-800 bg-black hover:border-gray-600 hover:bg-gray-950'}`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-gray-800 bg-gray-950 p-2">
                      <img
                        src={connector.logo}
                        alt={`${connector.name} logo`}
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white">{connector.name}</div>
                      <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">{connector.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
            <div className="flex min-h-0 flex-col gap-6">
              <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="border border-gray-800 bg-black p-6 lg:p-8">
                  <div className="flex items-center gap-5">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-gray-800 bg-gray-950 p-3 lg:h-28 lg:w-28">
                      <img src={activeConnector.logo} alt={`${activeConnector.name} logo`} className="h-full w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.35em] text-amber-500">
                        <ShieldCheck size={12} />
                        Active provider
                      </div>
                      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white lg:text-4xl">{activeConnector.name}</h2>
                      <p className="mt-2 text-base text-gray-400">{activeConnector.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="border border-gray-800 bg-black p-4">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">Scope</div>
                    <div className="mt-2 text-sm font-mono text-white">{activeConnector.scope}</div>
                  </div>
                  <div className="border border-gray-800 bg-black p-4">
                    <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">Storage</div>
                    <div className="mt-2 text-sm font-mono text-white">{activeConnector.storage}</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {activeConnector.fields.map((field) => (
                  <CmdInput
                    key={field.key}
                    label={field.label}
                    value={activeDraft[field.key] ?? ''}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    type={field.type}
                  />
                ))}
              </div>
            </div>

            <div className="flex min-h-0 flex-col gap-4">
              <div className="border border-gray-800 bg-gray-950/70 p-4">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-amber-500">
                  <CheckCircle2 size={12} />
                  Notes
                </div>
                <div className="mt-3 grid gap-2">
                  {activeConnector.notes.map((note) => (
                    <div key={note} className="flex items-start gap-2 text-xs font-mono text-gray-400">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-800 bg-black p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">Mode</div>
                    <div className="mt-2 text-sm font-mono text-green-500">Encrypted profile</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-mono uppercase tracking-widest text-gray-600">Status</div>
                    <div className={`mt-2 text-sm font-mono ${isSmartApi && connected ? 'text-green-500' : 'text-white'}`}>
                      {isSmartApi
                        ? loading
                          ? 'Connecting'
                          : connected
                            ? `Connected${clientCode ? ` / ${clientCode}` : ''}`
                            : 'Ready'
                        : 'Ready'}
                    </div>
                  </div>
                </div>
                {isSmartApi && expiresAt && (
                  <div suppressHydrationWarning className="mt-3 border-t border-gray-800 pt-3 text-[10px] font-mono text-gray-500">
                    Session expiry: {new Date(expiresAt).toLocaleString('en-US')}
                  </div>
                )}
                {isSmartApi && (error || message) && (
                  <div className={`mt-3 border-t border-gray-800 pt-3 text-xs font-mono ${error ? 'text-red-400' : 'text-green-500'}`}>
                    {error || message}
                  </div>
                )}
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex cursor-pointer items-center gap-3 select-none text-[10px] font-mono uppercase tracking-widest text-gray-500">
                  <span className={`relative inline-flex h-5 w-10 items-center rounded-full border transition-colors ${rememberVault ? 'border-amber-500 bg-amber-600/30' : 'border-gray-700 bg-gray-900'}`}>
                    <span className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${rememberVault ? 'translate-x-5' : 'translate-x-1'}`} />
                  </span>
                  Store this profile
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={rememberVault}
                    onChange={(event) => setRememberVault(event.target.checked)}
                  />
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={resetActiveDraft}
                    className="inline-flex items-center gap-2 border border-gray-700 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-gray-400 transition-colors hover:border-amber-500 hover:text-amber-500"
                  >
                    <RefreshCcw size={12} />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveActiveDraft()}
                    disabled={saveDisabled}
                    className="inline-flex items-center gap-2 bg-amber-600 px-5 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-black transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-500"
                  >
                    {loading ? 'Connecting' : 'Save'}
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TerminalPanel>
    </TerminalWorkspace>
  );
};

export default Auth;
