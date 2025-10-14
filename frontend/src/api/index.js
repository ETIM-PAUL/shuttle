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
        console.log("d",data?.data?.[15]?.assets[8])
        return data?.data?.[15]?.assets[8];
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
}