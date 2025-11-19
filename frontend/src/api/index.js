import { formatUnits } from 'viem'

export const getBtcBalance = async (address) => {
    try {
        const response = await fetch(`/api/v1/bitcoin/address/${address}/balance`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_XVERSE_API_Key
          },
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
}

export const getBtcPrice = async () => {
    try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        return data.bitcoin.usd;
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
}

export const getVesuGenesisDetails = async () => {
    try {
        const response = await fetch(`https://staging.api.vesu.xyz/pools`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        const data = await response.json();
        const prime = data?.data?.find((res) => res.name === "Prime");
        const xBTC = data?.data?.find((res) => res.name === "Re7 xBTC");

        console.log("prime", prime)

        return [
          {
            id: prime?.id,
            name: prime?.name,
            supplyApr: formatUnits(prime?.assets[2]?.stats?.btcFiSupplyApr?.value, prime?.assets[2]?.stats?.btcFiSupplyApr?.decimals),
            borrowedApr: formatUnits(prime?.assets[2]?.stats?.borrowApr?.value, prime?.assets[2]?.stats?.borrowApr?.decimals),
            interestRate: formatUnits(prime?.assets[2]?.interestRate?.value, prime?.assets[2]?.interestRate?.decimals),
            reserve: formatUnits(prime?.assets[2]?.config?.reserve?.value, prime?.assets[2]?.config?.reserve?.decimals),
            risk: prime?.assets[2]?.risk,
            totalSupplied: formatUnits(prime?.assets[2]?.stats?.totalSupplied?.value, (prime?.assets[2]?.stats?.totalSupplied?.decimals ?? 2)) + " WBTC",
            maxUtilization: formatUnits(prime?.assets[2]?.stats?.currentUtilization?.value, (prime?.assets[2]?.stats?.currentUtilization?.decimals ?? 18)),
          },
          {
            id:xBTC?.id,
            name: xBTC?.name,
            supplyApr: formatUnits(xBTC?.assets[8]?.stats?.btcFiSupplyApr?.value, xBTC?.assets[8]?.stats?.btcFiSupplyApr?.decimals),
            borrowedApr: formatUnits(xBTC?.assets[8]?.stats?.borrowApr?.value, xBTC?.assets[8]?.stats?.borrowApr?.decimals),
            interestRate: formatUnits(xBTC?.assets[8]?.interestRate?.value, xBTC?.assets[8]?.interestRate?.decimals),
            reserve: formatUnits(xBTC?.assets[8]?.config?.reserve?.value, xBTC?.assets[8]?.config?.reserve?.decimals),
            risk: xBTC?.assets[8]?.risk,
            totalSupplied: formatUnits(xBTC?.assets[8]?.stats?.totalSupplied?.value, (xBTC?.assets[8]?.stats?.totalSupplied?.decimals ?? 8)) + " WBTC",
            maxUtilization: formatUnits(xBTC?.assets[8]?.stats?.currentUtilization?.value, (xBTC?.assets[8]?.stats?.currentUtilization?.decimals ?? 18)),
          }
        ]
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
}

export const getTrovesGenesisDetails = async () => {
    try {
        const response = await fetch(`https://app.troves.fi/api/strategies`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        const strategy = data?.strategies?.find((res) => res.id === "evergreen_wbtc")

        return [
          {
            id: strategy?.id,
            name: strategy?.name,
            supplyApr: strategy?.apySplit?.baseApy,
            borrowedApr: strategy?.apySplit?.rewardsApy,
            interestRate: "",
            reserve: "",
            risk: strategy?.riskFactor,
            totalSupplied: Number(strategy?.tvlUsd).toFixed(2).toString() + "USD",
            maxUtilization: "",
          }
        ]
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
}