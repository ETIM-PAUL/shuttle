// xverseWallet.ts
import { request } from "sats-connect";
import { RpcProvider, Contract } from 'starknet';
import { formatUnits } from "./cn";

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    state_mutability: 'view',
    inputs: [{ name: 'account', type: 'core::starknet::contract_address::ContractAddress' }],
    outputs: [{ type: 'core::integer::u256' }]
  },
  {
    name: 'decimals',
    type: 'function',
    state_mutability: 'view',
    inputs: [],
    outputs: [{ type: 'core::integer::u8' }]
  },
  {
    name: 'symbol',
    type: 'function',
    state_mutability: 'view',
    inputs: [],
    outputs: [{ type: 'core::felt252' }]
  },
  {
    name: 'name',
    type: 'function',
    state_mutability: 'view',
    inputs: [],
    outputs: [{ type: 'core::felt252' }]
  }
];

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

    try {
      const response = await request('wallet_connect', null);
      if (response.status === 'success') {
        const paymentAddressItem = response.result.addresses.find(
          (address) => address.purpose === "payment"
        );
        const ordinalsAddressItem = response.result.addresses.find(
          (address) => address.purpose === "payment"
        );
        const starknetAddressItem = response.result.addresses.find(
          (address) => address.purpose === "starknet"
        );

        return {
          success: true,
          addresses: {
            payment: paymentAddressItem.address,
            ordinals: ordinalsAddressItem.address,
            starknet: starknetAddressItem.address
          },
          publicKey: paymentAddressItem.publicKey
        }
      } else {
        if (response.error.code === RpcErrorCode.USER_REJECTION) {
          return {
            success: false,
            error:response?.error
          };
        } else {
          return {
            success: false,
            error:response?.error
          };
        }
      }
    } catch (err) {
        alert(err.error);
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

    if (response.result) {
      // Convert satoshis to BTC (1 BTC = 100,000,000 satoshis)
      const balanceInBtc = (Number(response.result.confirmed) / 100000000).toFixed(8);
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

export async function getVesu_WBTC_Balance(userAddress) {
  const provider = new RpcProvider({ nodeUrl: import.meta.env.VITE_STARKNET_RPC || 'https://starknet.api.onfinality.io/public/rpc/v0_9' });
  console.log("provider", provider);
  const tokenAddress = "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac";
  const erc20 = new Contract(ERC20_ABI, tokenAddress, provider);

  const [balanceRes, decimalsRes] = await Promise.all([
    erc20.balanceOf(userAddress),
    erc20.decimals()
  ]);

  console.log("decimalsRes", decimalsRes);


  const raw = balanceRes;
  const decimals = Number(decimalsRes);
  let symbol, name;

  try {
    symbol = await erc20.symbol();
  } catch (error) {
    console.log("error", error)
  }
  try {
    name = await erc20.name();
  } catch (error) {
    console.log("error", error)
  }

  return {
    raw,
    decimals,
    human: formatUnits(raw, decimals),
    symbol,
    name
  };
} 

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