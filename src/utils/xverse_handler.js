// xverseWallet.ts

const XVERSE_INSTALL_URL = 'https://chromewebstore.google.com/detail/xverse-bitcoin-crypto-wal/idnnbdplmphpflfnlkomgpfbpcgelopg?hl=en-GB&authuser=0&pli=1';


export const isXverseInstalled = () => {
  return typeof window !== 'undefined' && 
         typeof window.XverseProviders?.BitcoinProvider !== 'undefined';
};

export const connectXverseWallet = async () => {
  try {
    // Check if Xverse is installed
    if (!isXverseInstalled()) {
      // Redirect to install page
      window.open(XVERSE_INSTALL_URL, '_blank');
      return {
        success: false,
        error: 'Xverse wallet not installed. Redirecting to Chrome Web Store...'
      };
    }

    const xverse = window.XverseProviders.BitcoinProvider;
console.log("verse", xverse)
    // Request wallet connection
    const response = await xverse.request('getAccounts', {
      purposes: ['payment', 'ordinals'],
      message: 'Connect to your app'
    });

    if (response.status === 'success') {
      return {
        success: true,
        addresses: {
          payment: response.result[0].address,
          ordinals: response.result[1].address
        }
      };
    } else {
      return {
        success: false,
        error: 'User rejected the connection'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Function to get BTC balance from Xverse wallet
export const getBtcBalance = async (address) => {
  try {
    if (!isXverseInstalled()) {
      return {
        success: false,
        error: 'Xverse wallet not installed'
      };
    }

    const xverse = window.XverseProviders.BitcoinProvider;
    
    // Request balance for the given address
    const response = await xverse.request('getBalance', {
      address: address,
      message: 'Get Bitcoin balance'
    });

    if (response.status === 'success') {
      // Convert satoshis to BTC (1 BTC = 100,000,000 satoshis)
      const balanceInBtc = (response.result.confirmed / 100000000).toFixed(8);
      return {
        success: true,
        balance: balanceInBtc
      };
    } else {
      return {
        success: false,
        error: 'Failed to get balance'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Helper function to check wallet status on page load
export const checkXverseOnLoad = (callback) => {
  if (document.readyState === 'complete') {
    callback(isXverseInstalled());
  } else {
    window.addEventListener('load', () => {
      // Give the extension time to inject
      setTimeout(() => {
        callback(isXverseInstalled());
      }, 100);
    });
  }
};