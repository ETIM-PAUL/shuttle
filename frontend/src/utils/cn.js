import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const mainVesuAddress = "0x0131cc09160f144ec5880a0bc1a0633999030fa6a546388b5d0667cb171a52a0"
export const primeVesuAddress = "0x04ecb0667140b9f45b067d026953ed79f22723f1cfac05a7b26c3ac06c88f56c"
export const mainTrovesAddress = "0x05a4c1651b913aa2ea7afd9024911603152a19058624c3e425405370d62bf80c"
export const wbtcAddress = "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac"
export const vesuImplAddress = "0x06027da5b39c337855be24cce5c441de4f218179510d28d20c0f6254e07e0b7c"
export const trovesImplAddress = "0x05a4c1651b913aa2ea7afd9024911603152a19058624c3e425405370d62bf80c"

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