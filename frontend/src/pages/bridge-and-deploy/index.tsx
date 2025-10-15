import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import TransactionStatusOverlay from '../../components/ui/TransactionStatusOverlay';
import BridgeInputPanel from './components/BridgeInputPanel';
import ProtocolSelectionCard from './components/ProtocolSelectionCard';
import TransactionPreviewPanel from './components/TransactionPreviewPanel';
import Icon from '../../components/AppIcon';
import { useGlobal } from '../../context/global';
import toast from 'react-hot-toast';
import { connect } from "@starknet-io/get-starknet"
import { parseUnits } from 'viem'

import {getProviders, getProviderById, request} from "sats-connect";
import {StarknetInitializer, StarknetInitializerType, StarknetSigner} from "@atomiqlabs/chain-starknet";
import {SwapperFactory, BitcoinNetwork, fromHumanReadableString, timeoutSignal} from "@atomiqlabs/sdk";
import {Account, CallData, Contract, RpcProvider, wallet, WalletAccount} from "starknet";
import {Transaction} from "@scure/btc-signer";
import { VESU_IMPL_ABI } from '../../utils/vesu_impl_abi';
import { mainTrovesAddress, mainVesuAddress, primeVesuAddress, trovesImplAddress, vesuImplAddress, wbtcAddress } from '../../utils/cn';
import { Main_Vesu_Abi } from '../../utils/main_vesu_abi';
import { Main_Trooves_Abi } from '../../utils/main_trooves_abi';
import { WBTC_abi } from '../../utils/main_wbtc_abi';
import { useEffect } from 'react';


const BridgeAndDeploy = () => {
  
  const {
    isWalletConnected, 
    handleGetWBTCBal,
    walletAddress,
    starknetAddress,
    btcBalance,
    protocols,
    btcPrice
  } = useGlobal();
  
  
  const [amount, setAmount] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [selectedPool, setSelectedPool] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [getingAtomiqOutput, setGettingAtomiqOutput] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showTransactionStatus, setShowTransactionStatus] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [atomiqOutput, setAtomiqOutput] = useState(null);
  
  const rpcProvider = new RpcProvider({
    nodeUrl: import.meta.env.VITE_STARKNET_RPC
  });

  const Factory = new SwapperFactory<[StarknetInitializerType]>([StarknetInitializer]);
  const Tokens = Factory.Tokens;

  const swapper = Factory.newSwapper({
    chains: {
      STARKNET: {
        rpcUrl: import.meta.env.VITE_STARKNET_RPC || 'https://starknet-mainnet.public.blastapi.io/rpc/v0_8'
      }
    },
    bitcoinNetwork: BitcoinNetwork.MAINNET,
  });
      
  const handleBridgingBTC2WBTC = async () => {

    setTransactionData({
      amount: amount,
      protocol: selectedProtocol?.name,
      hash: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
    });
  
    try {

      await swapper.init();

      // const swo = await connect();
      if (!isWalletConnected) {
        throw new Error('Failed to connect to wallet');
      }
      
      // // Create RPC provider first
      const rpcProvider = new RpcProvider({
        nodeUrl: import.meta.env.VITE_STARKNET_RPC
      });
      
      const swo = await connect({
        modalMode: "alwaysAsk",
        modalTheme: "dark",
        // include: ["xverse wallet"]
      });

      const starknetSigner = new StarknetSigner(await WalletAccount.connect(rpcProvider, swo));
      
      setShowTransactionStatus(true);
      
      const _exactIn = true;
      const _amount = fromHumanReadableString(amount, Tokens.BITCOIN.BTC);

      
      
      // Create the swap
      const swap = await swapper.swap(
        Tokens.BITCOIN.BTC,
        Tokens.STARKNET.WBTC,
        _amount,
        _exactIn,
        undefined,
        starknetAddress,
        {
          // gasAmount: 1_000_000_000_000_000_000n
        }
      );
      
      // Get funded PSBT
      const {psbt, signInputs} = await swap.getFundedPsbt({
        address: walletAddress, 
        publicKey: "0229920e161c77db688903fdc9f740b140e7174d090fcde01e456f5c78994b0033" // You'll need to get this from your Bitcoin wallet
      });
      
      const psbtBase64 = Buffer.from(psbt.toPSBT(0)).toString("base64");


      // Sign PSBT with Xverse wallet
      const response = await request('signPsbt', {
        psbt: psbtBase64,
        signInputs: {
          [walletAddress]: signInputs
        },
      });

      const signedPsbtBase64 = response.result.psbt;
  
      // Parse signed PSBT
      const signedTransaction = Transaction.fromPSBT(Buffer.from(signedPsbtBase64, "base64"));
      const bitcoinTxId = await swap.submitPsbt(signedTransaction);
  
      // Wait for payment
      await swap.waitForBitcoinTransaction(
        null, null,
        (txId, confirmations, targetConfirmations, transactionETAms) => {
          console.log(`Transaction ${txId} has ${confirmations}/${targetConfirmations} confirmations`);
        }
      );

      //Swap should get automatically claimed by the watchtowers, if not we can call swap.claim() ourselves
      try {
        await swap.waitTillClaimedOrFronted(timeoutSignal(120*1000));
      } catch (e) {
        //Claim ourselves when automatic claim doesn't happen in 30 seconds
        await swap.claim(starknetSigner);
        console.log("error", e)
      }
  
      setCompletedSteps([...completedSteps, "bridge_confirmation"])
      
    } catch (error) {
      console.error('Deploy error:', error);
      toast.error(`Shuttle failed: ${error.message}`);
      setIsDeploying(false);
    }
  }
  
  async function handleVesuProtocolDeposit() {
    try {      
      const selectedWalletSWO = await connect({
        modalMode: "alwaysAsk",
        modalTheme: "dark"
      });

      const myWalletAccount = await WalletAccount.connect(
        { nodeUrl: import.meta.env.VITE_STARKNET_RPC},
        selectedWalletSWO
      );

      let selectedContractAddress = selectedPool?.name === "Prime" ? primeVesuAddress : mainVesuAddress

      const wbtcCont = new Contract(WBTC_abi, wbtcAddress, myWalletAccount);
      const vesuCont = new Contract(Main_Vesu_Abi, selectedContractAddress, myWalletAccount);
    
      // Prepare calls using contract instances
      const approveCall = wbtcCont.populate('approve', {
        spender: selectedContractAddress,
        amount: parseUnits(atomiqOutput.toString(), 8),
      });

      const transferCall = vesuCont.populate('deposit', {
        assets: parseUnits(atomiqOutput.toString(), 8),
        receiver: starknetAddress,
      });

      // Execute both calls in one transaction
      const tx = await myWalletAccount.execute([approveCall, transferCall]);
      
      await rpcProvider.waitForTransaction(tx.transaction_hash);
      await handleGetWBTCBal(starknetAddress);
    
    setCompletedSteps([...completedSteps, "protocol_deployment"])
    
    setTimeout(() => {
      setCompletedSteps([...completedSteps, "yield_position"])
    }, 1500);
    
    setTimeout(() => {
      setIsDeploying(false);
      setShowTransactionStatus(false);
    }, 3000);

    toast.success("Assets deposit to Vesu Protocol");


    } catch (error) {
      setIsDeploying(false);
    toast.error(`Deposit failed: ${error.message}`);
    }
    
  }

  async function handleTrovesProtocolDeposit() {
    try {
      const selectedWalletSWO = await connect({
        modalMode: "alwaysAsk",
        modalTheme: "dark"
      });
      const myWalletAccount = await WalletAccount.connect(
        { nodeUrl: import.meta.env.VITE_STARKNET_RPC },
        selectedWalletSWO
      );

      const wbtcCont = new Contract(WBTC_abi, wbtcAddress, myWalletAccount);
      const trovesCont = new Contract(Main_Trooves_Abi, mainTrovesAddress, myWalletAccount);
    
      // Prepare calls using contract instances
      const approveCall = wbtcCont.populate('approve', {
        spender: mainTrovesAddress,
        amount: parseUnits(atomiqOutput.toString(), 8),
      });

      const transferCall = trovesCont.populate('deposit', {
        assets: parseUnits(atomiqOutput.toString(), 8),
        receiver: starknetAddress,
      });

      // Execute both calls in one transaction
      const tx = await myWalletAccount.execute([approveCall, transferCall]);
      
      await rpcProvider.waitForTransaction(tx.transaction_hash);

      await handleGetWBTCBal(starknetAddress);
    
    setCompletedSteps([...completedSteps, "protocol_deployment"])
    
    setTimeout(() => {
      setCompletedSteps([...completedSteps, "yield_position"])
    }, 1500);
    
    setTimeout(() => {
      setIsDeploying(false);
      setShowTransactionStatus(false);
    }, 3000);

    toast.success("Assets deposit to Troves Yield Protocol");
    } catch (error) {
      setIsDeploying(false);
    toast.error(`Deposit failed: ${error.message}`);
    }
    
  }

  const handleDeploy = async () => {
    if (!isWalletConnected) {
      toast.error("Wallet not connected");
      return;
    }
    if (!amount) {
      toast.error("Please enter amount greater than 0");
      return;
    }
    if (selectedProtocol && selectedPool === null) {
      toast.error("Please select a protocol and a strategy/pool");
      return;
    }

    setIsDeploying(true);
    try {
      await handleBridgingBTC2WBTC().then(async(res) => {
        if (selectedProtocol?.id === "troves-vault") {
          handleTrovesProtocolDeposit();
        } else {
          await handleVesuProtocolDeposit();
        }
      await handleGetWBTCBal(starknetAddress);

      });
    } catch (error) {
      console.error('Deploy error:', error);
    }
  };

  async function handleWBTCOutput () {
    try {
      setGettingAtomiqOutput(true);
      const _exactIn = true;
      const _amount = fromHumanReadableString(amount, Tokens.BITCOIN.BTC);

      await swapper.init();

      const swap = await swapper.swap(
        Tokens.BITCOIN.BTC,
        Tokens.STARKNET.WBTC,
        _amount,
        _exactIn,
        undefined,
        starknetAddress,
        {
          // gasAmount: 1_000_000_000_000_000_000n
        }
      );

    setAtomiqOutput(swap.getOutput().toString().replace(/[^\d.]/g, ""));
    if (swap.getOutput().toString()) {
      setGettingAtomiqOutput(false);
    }

    } catch (error) {
      setGettingAtomiqOutput(false);
    toast.error(`Output failed: ${error.message}`);
    }
    
  }

  const handleTransactionClose = () => {
    setShowTransactionStatus(false);
    setTransactionData(null);
    setAmount('');
    setSelectedProtocol(null);
  };

  const handlePoolSelect = (pool) => {
    setSelectedPool(pool);
  };

  useEffect(() => {
    if (amount > 0) {
      handleWBTCOutput();
    }
  }, [amount])
  


  return (
    <>
      <Helmet>
        <title>Bridge & Deploy - Bitcoin Yield Shuttle</title>
        <meta name="description" content="Bridge your Bitcoin to Starknet and deploy to yield protocols with one click" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Icon name="Rocket" size={24} className="text-accent" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground font-heading">
                    Bridge & Deploy
                  </h1>
                  <p className="text-muted-foreground">
                    Convert your Bitcoin to yield-generating positions in one click
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="TrendingUp" size={16} className="text-success" />
                    <span className="text-sm text-muted-foreground">Best APY</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground font-data">12.45%</span>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="DollarSign" size={16} className="text-accent" />
                    <span className="text-sm text-muted-foreground">Total TVL</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">$141.7M</span>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Users" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Active Users</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">2,847</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Input & Protocol Selection */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bridge Input Panel */}
                <BridgeInputPanel
                  amount={amount}
                  btcPrice={btcPrice}
                  onAmountChange={setAmount}
                  walletBalance={btcBalance}
                  isWalletConnected={true}
                />

                {/* Protocol Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground font-heading">
                      Select Yield Protocol
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Icon name="Shield" size={16} />
                      <span>All protocols audited</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {protocols?.map((protocol,index) => (
                      <ProtocolSelectionCard
                        key={index}
                        protocol={protocol}
                        isSelected={selectedProtocol?.id === protocol?.id}
                        isSelectedPool={selectedPool}
                        selectedProtocol={selectedProtocol}
                        onSelect={setSelectedProtocol}
                        setSelectedPool={setSelectedPool}
                        onSelectPool={handlePoolSelect}
                      />
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column - Transaction Preview */}
              <div className="space-y-6">
                <TransactionPreviewPanel
                  amount={amount}
                  atomiqOutput={atomiqOutput}
                  getingAtomiqOutput={getingAtomiqOutput}
                  selectedProtocol={selectedProtocol}
                  selectedPool={selectedPool}
                  onDeploy={handleDeploy}
                  isDeploying={isDeploying}
                />

                {/* Security Notice */}
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="Shield" size={20} className="text-accent mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">
                        Security Features
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Multi-signature wallet protection</li>
                        <li>• Smart contract audit verification</li>
                        <li>• Real-time risk monitoring</li>
                        <li>• Emergency withdrawal capabilities</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Protocol Comparison */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Protocol Comparison
                  </h4>

                  {protocols &&
                    <div className="space-y-2">
                      {protocols?.map((protocol) => (
                        <div key={protocol?.id} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{protocol?.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-foreground font-medium">{protocol?.apy}%</span>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                              protocol?.risk === 'Low' ? 'bg-success/10 text-success' :
                              protocol?.risk === 'Medium'? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                            }`}>
                              {protocol?.risk}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Transaction Status Overlay */}
        <TransactionStatusOverlay
          isVisible={showTransactionStatus}
          onClose={handleTransactionClose}
          transactionData={transactionData}
          completedSteps={completedSteps}
        />
      </div>
    </>
  );
};

export default BridgeAndDeploy;
