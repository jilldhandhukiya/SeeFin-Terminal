export type ConnectorField = {
  key: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'password';
};

export type ConnectorRegistryItem = {
  id: string;
  name: string;
  category: string;
  endpoint: string;
  description: string;
  logo: string;
  scope: string;
  storage: string;
  notes: string[];
  fields: ConnectorField[];
};

export const AUTH_CONNECTORS: ConnectorRegistryItem[] = [
  {
    id: 'smartapi',
    name: 'Angel One SmartAPI',
    category: 'Broker',
    endpoint: 'smartapi.angelone.in',
    description: 'Broker API for order routing and market data.',
    logo: 'https://play-lh.googleusercontent.com/iWsUCDr0qRHrSQr90BTrbMeIP9Y5GNUEaIRNuxdufPXZmKruGScnvs9zcOM8vLhOemaMs7VjenS5T_5OrQ-A=s96-rw',
    scope: 'Cash + F&O + market feed',
    storage: 'Private local JSON vault',
    notes: [
      'Client session is simulated in browser memory.',
      'No external broker connection required.',
    ],
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'Paste SmartAPI key' },
      { key: 'clientCode', label: 'Client Code', placeholder: 'Angel One client code' },
      { key: 'password', label: 'MPIN / Password', placeholder: 'SmartAPI login password', type: 'password' },
      { key: 'totpSecret', label: 'TOTP Secret', placeholder: 'Base32 authenticator secret', type: 'password' },
      { key: 'macAddress', label: 'MAC Address', placeholder: 'Device MAC address' },
      { key: 'clientLocalIp', label: 'Local IP', placeholder: 'Client local IP' },
      { key: 'clientPublicIp', label: 'Public IP', placeholder: 'Client public IP' },
    ],
  },
  {
    id: 'coindcx',
    name: 'CoinDCX API',
    category: 'Crypto',
    endpoint: 'coindcx.com/api',
    description: 'Crypto exchange profile for spot and futures.',
    logo: 'https://coindcx.com/wp-content/uploads/2024/02/coindcx-logo-white.svg',
    scope: 'Spot + margin + futures',
    storage: 'Encrypted workspace vault',
    notes: [
      'Separate read-only and trade-enabled keys.',
      'Keep secrets out of the page tree.',
    ],
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'CoinDCX API key' },
      { key: 'apiSecret', label: 'API Secret', placeholder: 'CoinDCX secret', type: 'password' },
      { key: 'passphrase', label: 'Passphrase', placeholder: 'Optional key label' },
      { key: 'scope', label: 'Scope note', placeholder: 'Read-only or trade-enabled' },
    ],
  },
  {
    id: 'binance',
    name: 'Binance API',
    category: 'Exchange',
    endpoint: 'binance.com/api',
    description: 'Global exchange profile for spot and futures.',
    logo: 'https://cdn.brandfetch.io/id-pjrLx_q/theme/dark/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1675846246641',
    scope: 'Spot + futures + portfolio',
    storage: 'Encrypted workspace vault',
    notes: [
      'Bind IP limits and scopes to the saved profile.',
      'Keep API and secret values isolated.',
    ],
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'Binance API key' },
      { key: 'apiSecret', label: 'API Secret', placeholder: 'Binance secret', type: 'password' },
      { key: 'ipAllowlist', label: 'IP Allowlist', placeholder: 'Optional restricted IP list' },
      { key: 'portfolioTag', label: 'Portfolio tag', placeholder: 'Deployment or desk label' },
    ],
  },
  {
    id: 'zerodha',
    name: 'Zerodha Kite',
    category: 'Broker',
    endpoint: 'zerodha.com',
    description: 'Broker profile for order routing.',
    logo: 'https://zerodha.com/static/images/logo.svg',
    scope: 'Cash + derivatives',
    storage: 'Encrypted workspace vault',
    notes: [
      'Keep the app key and secret together.',
      'Refresh the profile when the session changes.',
    ],
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'Kite app key' },
      { key: 'apiSecret', label: 'API Secret', placeholder: 'Kite secret', type: 'password' },
      { key: 'requestToken', label: 'Request Token', placeholder: 'Session token from login' },
      { key: 'redirectUrl', label: 'Redirect URL', placeholder: 'https://your-app/login/callback' },
    ],
  },
  {
    id: 'upstox',
    name: 'Upstox API',
    category: 'Broker',
    endpoint: 'upstox.com',
    description: 'Broker profile for equity and derivatives.',
    logo: 'https://assets.upstox.com/common/images/upstox-logo-white.svg',
    scope: 'Equity + F&O',
    storage: 'Encrypted workspace vault',
    notes: [
      'Keep client credentials and tokens together.',
      'Treat each desk or environment as its own profile.',
    ],
    fields: [
      { key: 'apiKey', label: 'API Key', placeholder: 'Upstox key' },
      { key: 'apiSecret', label: 'API Secret', placeholder: 'Upstox secret', type: 'password' },
      { key: 'accessToken', label: 'Access Token', placeholder: 'Current access token', type: 'password' },
      { key: 'sessionName', label: 'Session name', placeholder: 'Desk or environment label' },
    ],
  },
];
