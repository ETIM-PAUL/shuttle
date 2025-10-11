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

export const getVesuGenesisDetails = async () => {
    try {
        const response = await fetch(`https://dev.api.vesu.xyz/pools/566154675190438152544449762131613456939576463701265245209877893089848934391`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        return data?.data?.assets?.[3];
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
}