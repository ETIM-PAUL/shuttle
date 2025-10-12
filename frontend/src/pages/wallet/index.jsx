import React, { useState, useEffect } from 'react'
import Icon from '../../components/AppIcon'
import Button from '../../components/ui/Button'
import { useGlobal } from '../../context/global'
import { Helmet } from 'react-helmet'
import Header from '../../components/ui/Header'
import { RpcProvider, Contract } from 'starknet'
import { VESU_IMPL_ABI } from '../../utils/vesu_impl_abi'
import { Main_Trooves_Abi } from '../../utils/main_trooves_abi'
import { formatUnits } from '../../utils/cn'
import { vesuImplAddress, trovesImplAddress } from '../../utils/cn'
import toast from 'react-hot-toast'

const WalletSection = () => {
  const {
    isWalletConnected,
    isInstalled,
    isConnecting,
    walletAddress,
    starknetAddress,
    btcBalance,
    wBTCBalance,
    handleConnect,
    handleInstall
  } = useGlobal();

  const [isLoading, setIsLoading] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [selectedPercentage, setSelectedPercentage] = useState(100);
  
  const [troovesData, setTroovesData] = useState({
    deposits: { count: 0, amount: '0' },
    withdrawals: { count: 0, amount: '0' },
    redemptions: { count: 0, amount: '0' },
    balance: '0'
  });
  const [vesuData, setVesuData] = useState({
    deposits: { count: 0, amount: '0' },
    withdrawals: { count: 0, amount: '0' },
    redemptions: { count: 0, amount: '0' },
    balance: '0'
  });

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-muted rounded-lg"></div>
          <div>
            <div className="h-5 bg-muted rounded w-32 mb-2"></div>
            <div className="h-3 bg-muted rounded w-24"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-4">
              <div className="h-3 bg-muted rounded w-16 mb-2"></div>
              <div className="h-4 bg-muted rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Fetch protocol data
  const fetchProtocolData = async () => {
    if (!starknetAddress) return;
    
    setIsLoading(true);
    try {
      const provider = new RpcProvider({ 
        nodeUrl: import.meta.env.VITE_STARKNET_RPC || 'https://starknet-sepolia.public.blastapi.io' 
      });

      // Fetch Vesu data
      const vesuContract = new Contract(VESU_IMPL_ABI, vesuImplAddress, provider);
      const [vesuDeposited, vesuWithdrawn, vesuRedeemed] = await Promise.all([
        vesuContract.get_user_total_deposited(starknetAddress),
        vesuContract.get_user_total_withdrawn(starknetAddress),
        vesuContract.get_user_total_redeemed(starknetAddress)
      ]);

      // For Trooves, we'll use the same implementation for now
      // In a real scenario, you'd have a separate Trooves implementation contract
      const troovesContract = new Contract(VESU_IMPL_ABI, trovesImplAddress, provider);
      const [troovesDeposited, troovesWithdrawn, troovesRedeemed] = await Promise.all([
        troovesContract.get_user_total_deposited(starknetAddress),
        troovesContract.get_user_total_withdrawn(starknetAddress),
        troovesContract.get_user_total_redeemed(starknetAddress)
      ]);

      setVesuData({
        deposits: { 
          count: vesuDeposited > 0 ? 1 : 0, // Simplified - in reality you'd track individual transactions
          amount: formatUnits(vesuDeposited, 8) 
        },
        withdrawals: { 
          count: vesuWithdrawn > 0 ? 1 : 0,
          amount: formatUnits(vesuWithdrawn, 8) 
        },
        redemptions: { 
          count: vesuRedeemed > 0 ? 1 : 0,
          amount: formatUnits(vesuRedeemed, 8) 
        },
        balance: formatUnits(vesuDeposited - vesuWithdrawn - vesuRedeemed, 8)
      });

      setTroovesData({
        deposits: { 
          count: troovesDeposited > 0 ? 1 : 0,
          amount: formatUnits(troovesDeposited, 8) 
        },
        withdrawals: { 
          count: troovesWithdrawn > 0 ? 1 : 0,
          amount: formatUnits(troovesWithdrawn, 8) 
        },
        redemptions: { 
          count: troovesRedeemed > 0 ? 1 : 0,
          amount: formatUnits(troovesRedeemed, 8) 
        },
        balance: formatUnits(troovesDeposited - troovesWithdrawn - troovesRedeemed, 8)
      });

    } catch (error) {
      console.error('Error fetching protocol data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle redeem button click
  const handleRedeemClick = (protocol) => {
    setSelectedProtocol(protocol);
    setRedeemAmount(protocol.balance);
    setSelectedPercentage(100);
    setShowRedeemModal(true);
  };

  // Handle percentage selection
  const handlePercentageSelect = (percentage) => {
    setSelectedPercentage(percentage);
    const currentBalance = parseFloat(selectedProtocol?.balance || '0');
    const amount = (currentBalance * percentage / 100).toFixed(8);
    setRedeemAmount(amount);
  };

  // Handle redeem confirmation
  const handleRedeemConfirm = async () => {
    if (!selectedProtocol || !redeemAmount || parseFloat(redeemAmount) <= 0) {
      toast.error('Please enter a valid amount to redeem');
      return;
    }

    setIsRedeeming(true);
    try {
      // Here you would implement the actual redeem logic
      // For now, we'll just show a success message
      toast.success(`Redeeming ${redeemAmount} WBTC from ${selectedProtocol.name}...`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Redeem successful!');
      setShowRedeemModal(false);
      
      // Refresh data
      await fetchProtocolData();
      
    } catch (error) {
      console.error('Redeem error:', error);
      toast.error('Redeem failed. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowRedeemModal(false);
    setSelectedProtocol(null);
    setRedeemAmount('');
    setSelectedPercentage(100);
  };

  useEffect(() => {
    if (isWalletConnected && starknetAddress) {
      fetchProtocolData();
    }
  }, [isWalletConnected, starknetAddress]);

  if (!isWalletConnected) {
    return (
      <div>
        <Helmet>
          <title>History - Bitcoin Yield Shuttle</title>
          <meta name="description" content="View your transaction history and protocol balances" />
        </Helmet>

        <Header />

        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl p-6 text-center">
            <div className="mx-auto w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Icon name="Wallet" size={24} className="text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Connect your wallet</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Connect your Xverse wallet to view your transaction history and protocol balances.
            </p>
            {!isInstalled ? (
              <Button
                variant="outline"
                size="lg"
                onClick={handleInstall}
                iconName="Download"
                iconPosition="left"
                className="w-full"
              >
                Install Xverse Wallet
              </Button>
            ) : (
              <Button
                variant="default"
                size="lg"
                onClick={handleConnect}
                iconName="Wallet"
                iconPosition="left"
                className="w-full"
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
            <div className="mt-4 text-xs text-muted-foreground">
              By connecting, you agree to the platform terms and acknowledge risk in DeFi.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>History - Bitcoin Yield Shuttle</title>
        <meta name="description" content="View your transaction history and protocol balances" />
      </Helmet>

      <Header />
      <div className="px-4 mt-44">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Wallet Info Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Icon name="Wallet" size={20} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Your Wallet</h3>
                  <p className="text-xs text-muted-foreground">Connected via Xverse</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface border border-border rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Address</div>
                <div className="flex items-center space-x-2">
                  <Icon name="Link" size={16} className="text-muted-foreground" />
                  <span className="text-sm font-mono text-foreground">{shortenAddress(walletAddress)}</span>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">BTC Balance</div>
                <div className="flex items-center space-x-2">
                  <Icon name="Bitcoin" size={16} className="text-orange-500" />
                  <span className="text-sm font-data text-foreground">{btcBalance ?? '0.00000000'} BTC</span>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-lg p-4">
                <div className="text-xs text-muted-foreground mb-1">Wrapped BTC (WBTC) Balance</div>
                <div className="flex items-center space-x-2">
                  <Icon name="Coins" size={16} className="text-accent" />
                  <span className="text-sm font-data text-foreground">{wBTCBalance ?? '-'}</span>
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">Shown after bridging</div>
              </div>
            </div>
          </div>

          {/* Protocol Sections */}
          {isLoading ? (
            <div className="space-y-6">
              <LoadingSkeleton />
              <LoadingSkeleton />
            </div>
          ) : (
            <div className="space-y-6">

          <div className="bg-muted/50 border border-border rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={18} className="text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Transaction counts are the ones processed through Shuttle. There will be difference if transactions are done directly on the selected protocol, you can track individual transactions from blockchain events.
              </p>
            </div>
          </div>

              {/* Trooves Section */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Icon name="TrendingUp" size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Trooves Vault</h3>
                      <p className="text-xs text-muted-foreground">Automated yield farming</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">{troovesData.balance} WBTC</div>
                    <div className="text-xs text-muted-foreground">Accumulated Balance</div>
                    {parseFloat(troovesData.balance) === 0 && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleRedeemClick({ ...troovesData, name: 'Trooves Vault' })}
                        iconName="RefreshCw"
                        iconPosition="left"
                        className="mt-2 cursor-pointer"
                      >
                        Redeem
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">Deposits</div>
                    <div className="flex items-center space-x-2">
                      <Icon name="ArrowDown" size={16} className="text-green-500" />
                      <span className="text-sm font-data text-foreground">{troovesData.deposits.count} tx</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{troovesData.deposits.amount} WBTC</div>
                  </div>

                  <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">Withdrawals</div>
                    <div className="flex items-center space-x-2">
                      <Icon name="ArrowUp" size={16} className="text-red-500" />
                      <span className="text-sm font-data text-foreground">{troovesData.withdrawals.count} tx</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{troovesData.withdrawals.amount} WBTC</div>
                  </div>

                  <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">Redemptions</div>
                    <div className="flex items-center space-x-2">
                      <Icon name="RefreshCw" size={16} className="text-yellow-500" />
                      <span className="text-sm font-data text-foreground">{troovesData.redemptions.count} tx</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{troovesData.redemptions.amount} WBTC</div>
                  </div>
                </div>
              </div>

              {/* Vesu Section */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <Icon name="Banknote" size={20} className="text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Vesu Lending</h3>
                      <p className="text-xs text-muted-foreground">Supply WBTC to earn interest</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">{vesuData.balance} WBTC</div>
                    <div className="text-xs text-muted-foreground">Accumulated Balance</div>
                    {parseFloat(vesuData.balance) > 0 && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleRedeemClick({ ...vesuData, name: 'Vesu Lending' })}
                        iconName="RefreshCw"
                        iconPosition="left"
                        className="mt-2 cursor-pointer"
                      >
                        Redeem
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">Deposits</div>
                    <div className="flex items-center space-x-2">
                      <Icon name="ArrowDown" size={16} className="text-green-500" />
                      <span className="text-sm font-data text-foreground">{vesuData.deposits.count} tx</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{vesuData.deposits.amount} WBTC</div>
                  </div>

                  <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">Withdrawals</div>
                    <div className="flex items-center space-x-2">
                      <Icon name="ArrowUp" size={16} className="text-red-500" />
                      <span className="text-sm font-data text-foreground">{vesuData.withdrawals.count} tx</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{vesuData.withdrawals.amount} WBTC</div>
                  </div>

                  <div className="bg-surface border border-border rounded-lg p-4">
                    <div className="text-xs text-muted-foreground mb-1">Redemptions</div>
                    <div className="flex items-center space-x-2">
                      <Icon name="RefreshCw" size={16} className="text-yellow-500" />
                      <span className="text-sm font-data text-foreground">{vesuData.redemptions.count} tx</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{vesuData.redemptions.amount} WBTC</div>
                  </div>
                </div>
              </div>
            </div>
          )}

         
        </div>
      </div>

      {/* Redeem Confirmation Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-700 border border-border rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Redeem {selectedProtocol?.name}</h3>
              <button
                onClick={handleCloseModal}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-surface border border-border rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-2">Available Balance</div>
                <div className="text-lg font-semibold text-foreground">{selectedProtocol?.balance} WBTC</div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Select Percentage
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((percentage) => (
                    <Button
                      key={percentage}
                      variant={selectedPercentage === percentage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePercentageSelect(percentage)}
                      className="text-xs"
                    >
                      {percentage}%
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Amount to Redeem
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="0.00000000"
                    step="0.00000001"
                    min="0"
                    max={selectedProtocol?.balance}
                  />
                  <div className="absolute right-3 top-2 text-sm text-muted-foreground">WBTC</div>
                </div>
              </div>

              <div className="bg-muted/50 border border-border rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Icon name="Info" size={16} className="text-muted-foreground mt-0.5" />
                  <div className="text-xs text-muted-foreground">
                    <p className="mb-1">You will receive WBTC tokens in your wallet.</p>
                    <p>This action cannot be undone.</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                  disabled={isRedeeming}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleRedeemConfirm}
                  className="flex-1"
                  loading={isRedeeming}
                  disabled={!redeemAmount || parseFloat(redeemAmount) <= 0}
                >
                  {isRedeeming ? 'Redeeming...' : 'Confirm Redeem'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default WalletSection