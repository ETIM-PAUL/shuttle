import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const location = useLocation();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletBalance, setWalletBalance] = useState('0.00');
  const [networkStatus, setNetworkStatus] = useState({
    bitcoin: 'connected',
    lightning: 'connected',
    starknet: 'connected'
  });

  const navigationItems = [
    {
      label: 'Deploy',
      path: '/bridge-and-deploy',
      icon: 'Rocket',
      tooltip: 'Bridge Bitcoin and deploy to yield protocols'
    },
    {
      label: 'History',
      path: '/transaction-history',
      icon: 'History',
      tooltip: 'View transaction history and portfolio performance'
    }
  ];

  const handleWalletConnect = () => {
    if (!isWalletConnected) {
      setIsWalletConnected(true);
      setWalletBalance('0.12345678');
    } else {
      setIsWalletConnected(false);
      setWalletBalance('0.00');
    }
  };

  const getNetworkStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-success';
      case 'connecting':
        return 'text-warning';
      case 'disconnected':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const Logo = () => (
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
        <Icon name="Bitcoin" size={20} color="white" />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-semibold text-foreground font-heading">
          Bitcoin Yield
        </span>
        <span className="text-xs text-muted-foreground font-caption -mt-1">
          Shuttle
        </span>
      </div>
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-100 bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigationItems?.map((item) => (
            <a
              key={item?.path}
              href={item?.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-smooth group relative ${
                location?.pathname === item?.path
                  ? 'text-accent bg-accent/10' :'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title={item?.tooltip}
            >
              <Icon 
                name={item?.icon} 
                size={16} 
                className={location?.pathname === item?.path ? 'text-accent' : 'text-current'} 
              />
              <span>{item?.label}</span>
              {location?.pathname === item?.path && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full" />
              )}
            </a>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Network Status */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 bg-muted rounded-md">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getNetworkStatusColor(networkStatus?.bitcoin)} animate-pulse-soft`} />
              <span className="text-xs text-muted-foreground">BTC</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getNetworkStatusColor(networkStatus?.lightning)} animate-pulse-soft`} />
              <span className="text-xs text-muted-foreground">LN</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getNetworkStatusColor(networkStatus?.starknet)} animate-pulse-soft`} />
              <span className="text-xs text-muted-foreground">STRK</span>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-3">
            {isWalletConnected && (
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-surface rounded-md border">
                <Icon name="Wallet" size={16} className="text-accent" />
                <span className="text-sm font-data text-foreground">{walletBalance} BTC</span>
              </div>
            )}
            
            <Button
              variant={isWalletConnected ? "outline" : "default"}
              size="sm"
              onClick={handleWalletConnect}
              iconName={isWalletConnected ? "Check" : "Wallet"}
              iconPosition="left"
              className="transition-smooth"
            >
              {isWalletConnected ? 'Connected' : 'Connect Wallet'}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <Icon name="Menu" size={20} />
            </Button>
          </div>
        </div>
      </div>
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border bg-surface">
        <nav className="flex">
          {navigationItems?.map((item) => (
            <a
              key={item?.path}
              href={item?.path}
              className={`flex-1 flex flex-col items-center justify-center py-3 text-xs font-medium transition-smooth ${
                location?.pathname === item?.path
                  ? 'text-accent bg-accent/10' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon 
                name={item?.icon} 
                size={18} 
                className={`mb-1 ${location?.pathname === item?.path ? 'text-accent' : 'text-current'}`} 
              />
              <span>{item?.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;