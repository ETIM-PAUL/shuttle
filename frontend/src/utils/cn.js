import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const vesuImplAddress = "0x01324c38f5cd26a0eedd10901f22fbdb82934e30728aed88845423bbfb605d6e"
export const trovesImplAddress = "0x01324c38f5cd26a0eedd10901f22fbdb82934e30728aed88845423bbfb605d6e"

// Mock protocol data
export const protocols = [
  {
    id: 'troves-vault',
    name: 'Troves Vault',
    description: 'Automated yield farming with WBTC collateral',
    type: 'vault',
    apy: 12.45,
    risk: 'Medium',
    tvl: '45.2M',
    minDeposit: '0.001',
    lockPeriod: 'Flexible',
    features: ['Auto-compound', 'Liquidity Mining', 'Governance Rewards']
  },
  {
    id: 'vesu-lending',
    name: 'Vesu Lending',
    description: 'Supply WBTC to earn lending interest',
    type: 'lending',
    apy: 6.78,
    risk: 'Low',
    tvl: '67.8M',
    minDeposit: '0.001',
    lockPeriod: 'None',
    features: ['Instant Withdrawal', 'Variable APY', 'Overcollateralized']
  }
];

export const uint256ToBigInt = (u256) => {
    // Handles shapes { low, high } or [low, high]
    const low = typeof u256.low !== 'undefined' ? u256.low : u256[0];
    const high = typeof u256.high !== 'undefined' ? u256.high : u256[1];
    return (BigInt(high) << 128n) + BigInt(low);
  };
  
export const formatUnits = (valueBigInt, decimals) => {
  const d = BigInt(decimals);
  const base = 10n ** d;
  const whole = valueBigInt / base;
  const frac = valueBigInt % base;
  // Trim trailing zeros in fractional part
  const fracStr = frac.toString().padStart(Number(d), '0').replace(/0+$/, '');
  return fracStr.length ? `${whole.toString()}.${fracStr}` : whole.toString();
};