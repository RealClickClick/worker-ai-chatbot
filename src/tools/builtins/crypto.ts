import type { ToolDefinition } from '../types.ts';
import { FETCH_TIMEOUT_MS } from '../../constants.ts';

const COIN_MAP: Record<string, string> = {
  bitcoin: 'bitcoin', btc: 'bitcoin',
  ethereum: 'ethereum', eth: 'ethereum',
  tether: 'tether', usdt: 'tether',
  solana: 'solana', sol: 'solana',
  binance: 'binancecoin', bnb: 'binancecoin',
  xrp: 'ripple', ripple: 'ripple',
  cardano: 'cardano', ada: 'cardano',
  dogecoin: 'dogecoin', doge: 'dogecoin',
  polkadot: 'polkadot', dot: 'polkadot',
  avalanche: 'avalanche-2', avax: 'avalanche-2',
  tron: 'tron', trx: 'tron',
  matic: 'matic-network', polygon: 'matic-network',
  chainlink: 'chainlink', link: 'chainlink',
  ton: 'the-open-network', 'the open network': 'the-open-network',
  shiba: 'shiba-inu', shib: 'shiba-inu',
  litecoin: 'litecoin', ltc: 'litecoin',
  bitcoinCash: 'bitcoin-cash', bch: 'bitcoin-cash',
  pol: 'pol', 'polygon ecosystem': 'pol',
  uniswap: 'uniswap', uni: 'uniswap',
  stellar: 'stellar', xlm: 'stellar',
};

export const cryptoTool: ToolDefinition = {
  name: 'crypto',
  description: 'Get current cryptocurrency prices and market data. Supports major coins like Bitcoin, Ethereum, Solana, etc.',
  parameters: {
    coin: { type: 'string', description: 'Coin name or symbol (e.g., bitcoin, ethereum, solana, btc, eth)', required: true },
  },
  execute: async (params) => {
    const input = params.coin?.trim().toLowerCase();
    if (!input) return 'Please provide a coin name or symbol.';
    const coinId = COIN_MAP[input] || input;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
        { signal: controller.signal },
      );
      clearTimeout(timeout);
      if (!res.ok) {
        if (res.status === 404) return `Coin "${input}" not found. Try a different name.`;
        return `Price lookup failed (${res.status}).`;
      }
      const data = await res.json() as any;
      const coinData = data[coinId];
      if (!coinData) return `No data found for "${input}". Try a different coin name.`;
      const parts: string[] = [
        `Coin: ${input.toUpperCase()}`,
        `Price: $${coinData.usd?.toLocaleString() || 'N/A'}`,
      ];
      if (coinData.usd_24h_change !== undefined) {
        const change = coinData.usd_24h_change.toFixed(2);
        parts.push(`24h Change: ${change >= 0 ? '+' : ''}${change}%`);
      }
      if (coinData.usd_market_cap) {
        parts.push(`Market Cap: $${(coinData.usd_market_cap / 1e9).toFixed(2)}B`);
      }
      return parts.join('\n');
    } catch (e: any) {
      return `Price lookup failed: ${e.message}`;
    }
  },
};
