'use client';

import React, { useEffect } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset?: () => void;
  retry?: () => void;
};

export default function GlobalError({ error, reset, retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[CRITICAL] Root Layout Global Error:', error);
  }, [error]);

  const handleRetry = () => {
    if (typeof retry === 'function') {
      retry();
    } else if (typeof reset === 'function') {
      reset();
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <html lang="en" className="dark bg-black">
      <head>
        <title>SEEFIN // SYSTEM CRITICAL FAULT</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#000000',
          color: '#e4e4e7',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '640px',
            width: '90%',
            border: '1px solid #7f1d1d',
            backgroundColor: '#09090b',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(127, 29, 29, 0.25)',
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(127, 29, 29, 0.5)',
              paddingBottom: '12px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#ef4444',
                }}
              />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 'bold',
                  letterSpacing: '0.1em',
                  color: '#ef4444',
                  textTransform: 'uppercase',
                }}
              >
                CRITICAL_KERNEL_FAULT // ROOT_LAYOUT_CRASH
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#71717a' }}>HALT 0x0001</span>
          </div>

          {/* Description */}
          <h1
            style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#ffffff',
              margin: '0 0 8px 0',
              textTransform: 'uppercase',
            }}
          >
            System Layout Terminated
          </h1>
          <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '0 0 16px 0', lineHeight: 1.6 }}>
            A fatal exception occurred within the terminal root environment. The application
            shell could not initialize.
          </p>

          {/* Traceback box */}
          <div
            style={{
              border: '1px solid #27272a',
              backgroundColor: '#000000',
              padding: '14px',
              fontSize: '11px',
              color: '#d4d4d8',
              overflowX: 'auto',
              marginBottom: '20px',
              wordBreak: 'break-word',
            }}
          >
            <div style={{ color: '#f87171', fontWeight: 'bold', marginBottom: '6px' }}>
              PANIC: {error?.name || 'Error'}
            </div>
            <div style={{ color: '#a1a1aa' }}>
              {error?.message || 'An unexpected error crashed the root layout.'}
            </div>
            {error?.digest && (
              <div
                style={{
                  marginTop: '8px',
                  paddingTop: '6px',
                  borderTop: '1px solid #18181b',
                  fontSize: '10px',
                  color: '#52525b',
                }}
              >
                DIGEST: {error.digest}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={handleRetry}
              style={{
                backgroundColor: '#f59e0b',
                color: '#000000',
                border: '1px solid #f59e0b',
                padding: '8px 18px',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              RESTART APPLICATION
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = '/';
              }}
              style={{
                backgroundColor: '#000000',
                color: '#a1a1aa',
                border: '1px solid #27272a',
                padding: '8px 18px',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              WARM REBOOT (HOME)
            </button>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: '24px',
              paddingTop: '12px',
              borderTop: '1px solid #18181b',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: '#52525b',
            }}
          >
            <span>SEEFIN KERNEL LEVEL 0</span>
            <span>DIAGNOSTIC_MODE: ACTIVE</span>
          </div>
        </div>
      </body>
    </html>
  );
}
