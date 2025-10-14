// src/context/global.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { checkXverseOnLoad, connectXverseWallet, getBtcBalance, getVesu_WBTC_Balance } from "../utils/xverse_handler";
import toast from "react-hot-toast";
import { getBtcPrice, getVesuGenesisDetails } from "../api";
import { formatUnits } from 'viem'

// Create the context
const GlobalContext = createContext();

// Create a provider component
export const GlobalProvider = ({ children }) => {
    const [isWalletConnected, setIsWalletConnected] = useState(null);
    const [btcBalance, setBtcBalance] = useState(null);
    const [walletAddress, setWalletAddress] = useState(null);
    const [starknetAddress, setStarknetAddress] = useState(null);
    const [wBTCBalance, setWBTCBalance] = useState(null);
    const [ordinalsAddress, setOrdinalsAddress] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [btcPrice, setBtcPrice] = useState(null);
    const [protocols, setProtocols] = useState([
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
      }
    ]);
  
    useEffect(() => {
      // Check if wallet is installed on component mount
      getBtcPrice().then((res) =>
        setBtcPrice(res?.rate)
      );
      handleGetVesuPoolDetails();
      checkXverseOnLoad((installed) => {
        setIsInstalled(installed);
      });
    }, []);

    const handleGetWBTCBal = async (address) => {
      setError(null);
      try {
          const res = await getVesu_WBTC_Balance(address);
          setWBTCBalance(res?.human);
        } catch (error) {
          console.log("error", error)
      };
    };

    const handleGetVesuPoolDetails = async () => {
      try {
          const res = await getVesuGenesisDetails(); 
                   console.log("r",res)
          setProtocols([...protocols, {
            id: 'vesu-lending',
            name: 'Vesu Lending',
            description: 'Supply WBTC to earn lending interest',
            type: 'lending',
            supplyApy: formatUnits(res?.stats?.supplyApy?.value, res?.stats?.supplyApy?.decimals),
            borrowedApr: formatUnits(res?.stats?.borrowApr?.value, res?.stats?.borrowApr?.decimals),
            interestRate: formatUnits(res?.interestRate?.value, res?.interestRate?.decimals),
            reserve: formatUnits(res?.config?.reserve?.value, res?.config?.reserve?.decimals),
            risk: res?.risk?.url,
            totalSupplied: formatUnits(res?.stats?.totalSupplied?.value, (res?.stats?.totalSupplied?.decimals ?? 8)),
            maxUtilization: formatUnits(res?.config?.maxUtilization?.value, (res?.config?.maxUtilization?.decimals ?? 8)),
            lockPeriod: 'None',
            features: ['Instant Withdrawal', 'Variable APY', 'Overcollateralized']
          }]);
        } catch (error) {
          console.log("error", error)
      };
    };
    
    const handleConnect = async () => {
      setIsConnecting(true);
      setError(null);
      try {
        const result = await connectXverseWallet();
        if (result.success && result.addresses) {
          setWalletAddress(result.addresses.payment); // Use payment address as primary
          setStarknetAddress(result.addresses.starknet); // Use payment address as primary
          setOrdinalsAddress(result.addresses.ordinals); // Use payment address as primary
          setIsWalletConnected(true);
          
          const bal = await getBtcBalance(result.addresses.payment);
          setBtcBalance(bal?.balance);
          await handleGetWBTCBal(result.addresses.starknet);
          toast.success("Wallet connected successfully")
        }
        setIsConnecting(false);   
  
        } catch (error) {
  
          setError(error.error || 'Failed to connect');
          // toast.error(e?.error)
          setIsConnecting(false);   
      };
    };
  
    const handleInstall = () => {
      window.open(
        'https://chromewebstore.google.com/detail/xverse-bitcoin-crypto-wal/idnnbdplmphpflfnlkomgpfbpcgelopg?hl=en-GB&authuser=0&pli=1',
        '_blank'
      );
    };

  const value = {
    isWalletConnected,
    setIsWalletConnected,
    isConnecting,
    setIsConnecting,
    btcBalance,
    btcPrice,
    setBtcBalance,
    wBTCBalance,
    setWBTCBalance,
    walletAddress,
    starknetAddress,
    ordinalsAddress,
    setWalletAddress,
    isInstalled,
    protocols,
    setIsInstalled,
    handleConnect,
    handleInstall,
    handleGetWBTCBal
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to use the global context
export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
};
