// src/context/global.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { checkXverseOnLoad, connectXverseWallet, getBtcBalance } from "../utils/xverse_handler";
import toast from "react-hot-toast";

// Create the context
const GlobalContext = createContext();

// Create a provider component
export const GlobalProvider = ({ children }) => {
    const [isWalletConnected, setIsWalletConnected] = useState(null);
    const [btcBalance, setBtcBalance] = useState(null);
    const [walletAddress, setWalletAddress] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      // Check if wallet is installed on component mount
      checkXverseOnLoad((installed) => {
        setIsInstalled(installed);
      });
    }, []);

    const handleConnect = async () => {
      setIsConnecting(true);
      setError(null);
      try {
        const result = await connectXverseWallet();
        if (result.success && result.addresses) {
          setWalletAddress(result.addresses.payment); // Use payment address as primary
          setIsWalletConnected(true);
          
          const bal = await getBtcBalance(result.addresses.payment);
        console.log("re", bal)

          setBtcBalance(bal?.balance);
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
    setBtcBalance,
    walletAddress,
    setWalletAddress,
    isInstalled,
    setIsInstalled,
    handleConnect,
    handleInstall
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
