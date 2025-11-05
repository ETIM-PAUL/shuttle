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
// import { connect } from "@starknet-io/get-starknet"
import { parseUnits } from 'viem'

import {request} from "sats-connect";
import {StarknetInitializer, StarknetInitializerType, StarknetSigner} from "@atomiqlabs/chain-starknet";
import {SwapperFactory, BitcoinNetwork, fromHumanReadableString, timeoutSignal} from "@atomiqlabs/sdk";
import {Contract, RpcProvider, wallet, WalletAccount} from "starknet";
import {Transaction} from "@scure/btc-signer";
import { mainTrovesAddress, mainVesuAddress, primeVesuAddress, trovesImplAddress, vesuImplAddress, wbtcAddress } from '../../utils/cn';
import { Main_Vesu_Abi } from '../../utils/main_vesu_abi';
import { Main_Trooves_Abi } from '../../utils/main_trooves_abi';
import { WBTC_abi } from '../../utils/main_wbtc_abi';
import { useEffect } from 'react';
import { connect } from '@starknet-io/get-starknet';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';


const BridgeAndDeploy = () => {
  
  const {
    isWalletConnected, 
    handleGetWBTCBal,
    walletAddress,
    starknetAddress,
    appPublicKey,
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
  const [lightningSupport, setLightningSupport] = useState(false);
  const [receivingLightningInvoice, setReceivingLightningInvoice] = useState('');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [showLightningModal, setShowLightningModal] = useState(false);
  
  const rpcProvider = new RpcProvider({
    nodeUrl: import.meta.env.VITE_STARKNET_RPC
  });


  const Factory = new SwapperFactory<[StarknetInitializerType]>([StarknetInitializer] as const);
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
      hash: ''
    });
    let txtId;
    await swapper.init();

    // const swo = await connect();
    if (!isWalletConnected) {
      throw new Error('Failed to connect to wallet');
    }
    
    // // Create RPC provider first
    const rpcProvider = new RpcProvider({
      nodeUrl: import.meta.env.VITE_STARKNET_RPC
    });
    setShowTransactionStatus(true);

    
    const swo = await connect({
      modalMode: "alwaysAsk",
      modalTheme: "dark",
      // include: ["xverse wallet"]
    });


    try {
      const starknetSigner = new StarknetSigner(await WalletAccount.connect(rpcProvider, swo));
      
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
        publicKey: appPublicKey // You'll need to get this from your Bitcoin wallet
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
      txtId = bitcoinTxId
  
      // Wait for payment
      await swap.waitForBitcoinTransaction(
        null, null,
        (txId, confirmations, targetConfirmations, transactionETAms) => {
          console.log(`Transaction ${txId} has ${confirmations}/${targetConfirmations} confirmations`);
        }
      );

      setTransactionData({...transactionData, "id": txtId})

      //Swap should get automatically claimed by the watchtowers, if not we can call swap.claim() ourselves
      try {
        await swap.waitTillClaimedOrFronted(timeoutSignal(120*1000));
      } catch (e) {
        //Claim ourselves when automatic claim doesn't happen in 30 seconds
        await swap.claim(starknetSigner);
        console.log("error", e)
      }
  
      setCompletedSteps([...completedSteps, "bridge_confirmation"])

      if (selectedProtocol?.id === "troves-vault") {
        handleTrovesProtocolDeposit();
      } else if (selectedProtocol?.id === "vesu-lending") {
        await handleVesuProtocolDeposit();
      }
    await handleGetWBTCBal(starknetAddress);
      
    } catch (error) {
      console.error('Deploy error:', error);
      toast.error(`Shuttle failed: ${error.message}`);
      setIsDeploying(false);
      setShowTransactionStatus(false);
    }
  }

  const handleLightningBridgingBTC2WBTC = async () => {
    setTransactionData({
      amount: amount,
      protocol: selectedProtocol?.name,
      hash: ''
    });
    await swapper.init();

    
    // // Create RPC provider first
    const rpcProvider = new RpcProvider({
      nodeUrl: import.meta.env.VITE_STARKNET_RPC
    });
    setShowTransactionStatus(true);

    
    const swo = await connect({
      modalMode: "alwaysAsk",
      modalTheme: "dark",
      // include: ["xverse wallet"]
    });


    try {
      const starknetSigner = new StarknetSigner(await WalletAccount.connect(rpcProvider, swo));
      
      const _exactIn = true;
      const _amount = fromHumanReadableString(amount, Tokens.BITCOIN.BTC);
      
      // Create the swap
      const swap = await swapper.swap(
        Tokens.BITCOIN.BTCLN,
        Tokens.STARKNET.WBTC,
        _amount,
        _exactIn,
        undefined,
        starknetAddress,
        {
          // gasAmount: 1_000_000_000_000_000_000n
        }
      );

      //Get the bitcoin lightning network invoice (the invoice contains pre-entered amount)
      const receivingLightningInvoice: string = swap.getAddress();
      //Get the URI hyperlink (contains the lightning network invoice) which can be displayed also as QR code
      const qrCodeData: string = swap.getHyperlink();
      
      console.log("qrcode", qrCodeData)
      setReceivingLightningInvoice(receivingLightningInvoice);
      setQrCodeData(qrCodeData);
      setExpiryDate(swap.getQuoteExpiry());
      setShowTransactionStatus(false);
      setShowLightningModal(true);
      
  
      // Wait for payment
      const success = await swap.waitForPayment()
        if(!success) {
          setIsDeploying(false);
          setShowTransactionStatus(false);
          toast.error("Lightning network payment not received in time and quote expired");
          return;
        };

      const automaticSettlementSuccess = await swap.waitTillClaimed(60);

      if(!automaticSettlementSuccess) {
        await swap.claim(starknetSigner);
      }
  
      setCompletedSteps([...completedSteps, "bridge_confirmation"])

      setShowTransactionStatus(true);
      setShowLightningModal(false);

      if (selectedProtocol?.id === "troves-vault") {
        handleTrovesProtocolDeposit();
      } else if (selectedProtocol?.id === "vesu-lending") {
        await handleVesuProtocolDeposit();
      }
      await handleGetWBTCBal(starknetAddress);
      
    } catch (error) {
      console.error('Deploy error:', error);
      toast.error(`Shuttle failed: ${error.message}`);
      setIsDeploying(false);
      setShowTransactionStatus(false);
    }
  }
  
  async function handleVesuProtocolDeposit() {

    const swo = await connect({
      modalMode: "alwaysAsk",
      modalTheme: "dark",
      // include: ["xverse wallet"]
    });
    

    const myWalletAccount = await WalletAccount.connect(
      { nodeUrl: import.meta.env.VITE_STARKNET_RPC},
      swo
    );

    try {      
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
      const tx = await myWalletAccount.execute([approveCall]);
      await rpcProvider.waitForTransaction(tx.transaction_hash);
      const tx2 = await myWalletAccount.execute([transferCall]);
      await rpcProvider.waitForTransaction(tx2.transaction_hash);
      
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

    const swo = await connect({
      modalMode: "alwaysAsk",
      modalTheme: "dark",
      // include: ["xverse wallet"]
    });

    const myWalletAccount = await WalletAccount.connect(
      { nodeUrl: import.meta.env.VITE_STARKNET_RPC},
      swo
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
      const tx = await myWalletAccount.execute([approveCall]);
      await rpcProvider.waitForTransaction(tx.transaction_hash);
      const tx2 = await myWalletAccount.execute([transferCall]);
      await rpcProvider.waitForTransaction(tx2.transaction_hash);

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
    setShowTransactionStatus(true);

    try {
      if (lightningSupport) {
        await handleLightningBridgingBTC2WBTC();
      } else {
        await handleBridgingBTC2WBTC();
      }
    } catch (error) {
      console.error('Deploy error:', error);
    }
  };

  async function handleWBTCOutput () {
    try {
      setGettingAtomiqOutput(true);
      const _exactIn = true;
      const _amount = fromHumanReadableString(amount, lightningSupport ? Tokens.BITCOIN.BTCLN : Tokens.BITCOIN.BTC );

      await swapper.init();

      let swap;

      if (lightningSupport) {
        swap = await swapper.swap(
          Tokens.BITCOIN.BTCLN,
          Tokens.STARKNET.WBTC,
          _amount,
          _exactIn,
          undefined,
          starknetAddress,
        );

      } else {
        swap = await swapper.swap(
          Tokens.BITCOIN.BTC,
          Tokens.STARKNET.WBTC,
          _amount,
          _exactIn,
          undefined,
          starknetAddress,
        );
      }

      console.log("swap", swap.getOutput())

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
      <div className="min-h-screen z-10 bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
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

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Input type="checkbox" className="focus:ring-0 focus:outline-none" name="Lightning Network Support" size={16} checked={lightningSupport} onChange={() => setLightningSupport(!lightningSupport)} />
                  <span className="text-md font-black text-muted-foreground">Lightning Network Support</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="TrendingUp" size={16} className="text-success" />
                    <span className="text-sm text-muted-foreground">Best APY</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground font-data">3.24%</span>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="DollarSign" size={16} className="text-accent" />
                    <span className="text-sm text-muted-foreground">Total TVL</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">$12.7M</span>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Users" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Active Pools/Strategies</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">3</span>
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
                  isWalletConnected={isWalletConnected}
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
                        <li>• Non-Custodial Architecture</li>
                        <li>• Smart contract audit verification</li>
                        <li>• Real-time risk monitoring</li>
                        <li>• Layer 2 Security Inheritance</li>
                        <li>• Trustless Cross-Chain Bridge</li>
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

        {lightningSupport && showLightningModal && (
          <div className="fixed inset-0 z-10 bg-black/50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowLightningModal(false)}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="ln-invoice-title"
              className="relative bg-gray-700 border border-border rounded-lg w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h4 id="ln-invoice-title" className="text-base font-semibold text-foreground">
                  Lightning Network Invoice
                </h4>
                <button
                  type="button"
                  onClick={() => setShowLightningModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-start space-x-2">
                  <span className="text-muted-foreground mt-0.5">Invoice:</span>
                  <span className="text-foreground font-medium break-all flex-1">
                    {receivingLightningInvoice}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-muted-foreground">QR Code:</span>
                  {/* <img src={qrCodeData} alt="QR Code" className="w-32 h-32" /> */}
                  <img
                  src={qrCodeData ? `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrCodeData)}` : ''}
                  alt="Lightning Invoice QR"
                  className="w-32 h-32"
                />
                </div>
              </div>

              <div className="p-4 border-t border-border flex justify-end gap-2">
                <Button
                  variant="default" size="sm"
                  onClick={() => setShowLightningModal(false)}
                  className="px-3 py-1.5 cursor-pointer rounded-md border border-border text-foreground hover:bg-muted/50 transition"
                >
                  Close
                </Button>
                <Button
                  variant="default" size="sm"
                  onClick={() => navigator.clipboard?.writeText(receivingLightningInvoice)}
                  className="px-3 py-1.5 cursor-pointer rounded-md border border-border bg-accent text-white hover:opacity-90 transition"
                >
                  Copy Invoice
                </Button>
              </div>
            </div>
          </div>
        )}

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
