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
        const response = await fetch(`/api/v1/bitcoin/price`, {
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

export const getVesuGenesisDetails = async () => {
    try {
        const response = await fetch(`https://staging.api.vesu.xyz/pools`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        const data = await response.json();

        return [
          {
            id: data?.data[15]?.id,
            name: data?.data[15]?.name,
            supplyApr: formatUnits(data?.data[15]?.assets[8]?.stats?.btcFiSupplyApr?.value, data?.data[19]?.assets[4]?.stats?.btcFiSupplyApr?.decimals),
            borrowedApr: formatUnits(data?.data[15]?.assets[8]?.stats?.borrowApr?.value, data?.data[19]?.assets[4]?.stats?.borrowApr?.decimals),
            interestRate: formatUnits(data?.data[15]?.assets[8]?.interestRate?.value, data?.data[19]?.assets[4]?.interestRate?.decimals),
            reserve: formatUnits(data?.data[15]?.assets[8]?.config?.reserve?.value, data?.data[15]?.assets[8]?.config?.reserve?.decimals),
            risk: data?.data[59]?.assets[8]?.risk,
            totalSupplied: formatUnits(data?.data[15]?.assets[8]?.stats?.totalSupplied?.value, (data?.data[19]?.assets[4]?.stats?.totalSupplied?.decimals ?? 8)) + " WBTC",
            maxUtilization: formatUnits(data?.data[15]?.assets[8]?.stats?.currentUtilization?.value, (data?.data[19]?.assets[4]?.stats?.currentUtilization?.decimals ?? 18)),
          },
          {
            id: data?.data[19]?.id,
            name: data?.data[19]?.name,
            supplyApr: formatUnits(data?.data[19]?.assets[4]?.stats?.btcFiSupplyApr?.value, data?.data[19]?.assets[4]?.stats?.btcFiSupplyApr?.decimals),
            borrowedApr: formatUnits(data?.data[19]?.assets[4]?.stats?.borrowApr?.value, data?.data[19]?.assets[4]?.stats?.borrowApr?.decimals),
            interestRate: formatUnits(data?.data[19]?.assets[4]?.interestRate?.value, data?.data[19]?.assets[4]?.interestRate?.decimals),
            reserve: formatUnits(data?.data[19]?.assets[4]?.config?.reserve?.value, data?.data[19]?.assets[4]?.config?.reserve?.decimals),
            risk: data?.data[19]?.assets[4]?.risk,
            totalSupplied: formatUnits(data?.data[19]?.assets[4]?.stats?.totalSupplied?.value, (data?.data[19]?.assets[4]?.stats?.totalSupplied?.decimals ?? 8)) + " WBTC",
            maxUtilization: formatUnits(data?.data[19]?.assets[4]?.stats?.currentUtilization?.value, (data?.data[19]?.assets[4]?.stats?.currentUtilization?.decimals ?? 18)),
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