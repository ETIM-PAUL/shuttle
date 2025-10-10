import React from 'react'
import Icon from '../../components/AppIcon'
import Button from '../../components/ui/Button'
import { useGlobal } from '../../context/global'
import { Helmet } from 'react-helmet'
import Header from '../../components/ui/Header'

const WalletSection = () => {
  const {
    isWalletConnected,
    isInstalled,
    isConnecting,
    walletAddress,
    btcBalance,
    wBTCBalance,
    handleConnect,
    handleInstall
  } = useGlobal();

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isWalletConnected) {
    return (
      <div>
        <Helmet>
        <title>Bridge & Deploy - Bitcoin Yield Shuttle</title>
        <meta name="description" content="Bridge your Bitcoin to Starknet and deploy to yield protocols with one click" />
      </Helmet>

      <Header />

      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-card border border-border rounded-xl p-6 text-center">
          <div className="mx-auto w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
            <Icon name="Wallet" size={24} className="text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Connect your wallet</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Connect your Xverse wallet to view your Bitcoin balances and start bridging.
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
      <Header />
      <div className="px-4 mt-44">
        <div className="max-w-3xl mx-auto space-y-6">
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

          <div className="bg-muted/50 border border-border rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={18} className="text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                To acquire WBTC, bridge your BTC from the Bridge & Deploy page and complete a strategy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default WalletSection