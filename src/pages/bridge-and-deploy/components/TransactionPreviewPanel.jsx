import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TransactionPreviewPanel = ({ 
  amount, 
  selectedProtocol, 
  onDeploy,
  isDeploying = false 
}) => {
  const [fees, setFees] = useState({
    bridgeFee: '0.00012',
    networkFee: '0.00008',
    protocolFee: '0.00005'
  });
  
  const [slippage, setSlippage] = useState(0.5);
  const [estimatedOutput, setEstimatedOutput] = useState('0.00000000');

  useEffect(() => {
    if (amount && !isNaN(amount)) {
      const totalFees = parseFloat(fees?.bridgeFee) + parseFloat(fees?.networkFee) + parseFloat(fees?.protocolFee);
      const output = (parseFloat(amount) - totalFees)?.toFixed(8);
      setEstimatedOutput(Math.max(0, output));
    } else {
      setEstimatedOutput('0.00000000');
    }
  }, [amount, fees]);

  const transactionSteps = [
    {
      step: 1,
      title: 'Bridge BTC to WBTC',
      description: 'Convert native Bitcoin to Wrapped Bitcoin via Atomiq',
      icon: 'ArrowRightLeft',
      status: 'pending'
    },
    {
      step: 2,
      title: 'Deploy to Starknet',
      description: 'Transfer WBTC to Starknet network',
      icon: 'Rocket',
      status: 'pending'
    },
    {
      step: 3,
      title: 'Protocol Allocation',
      description: `Deposit into ${selectedProtocol?.name || 'selected protocol'}`,
      icon: 'Target',
      status: 'pending'
    }
  ];

  const totalFees = parseFloat(fees?.bridgeFee) + parseFloat(fees?.networkFee) + parseFloat(fees?.protocolFee);
  const canDeploy = amount && parseFloat(amount) > 0 && selectedProtocol && parseFloat(amount) > totalFees;

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground font-heading">
          Transaction Preview
        </h3>
        <div className="flex items-center space-x-2">
          <Icon name="Clock" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">~15-45 min</span>
        </div>
      </div>
      {/* Transaction Flow */}
      <div className="space-y-3">
        {transactionSteps?.map((step, index) => (
          <div key={step?.step} className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium text-muted-foreground">
              {step?.step}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Icon name={step?.icon} size={16} className="text-accent" />
                <span className="text-sm font-medium text-foreground">
                  {step?.title}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {step?.description}
              </p>
            </div>
            {index < transactionSteps?.length - 1 && (
              <Icon name="ChevronDown" size={16} className="text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
      {/* Fee Breakdown */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground">Fee Breakdown</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Bridge Fee</span>
            <span className="text-foreground font-data">{fees?.bridgeFee} BTC</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Network Fee</span>
            <span className="text-foreground font-data">{fees?.networkFee} BTC</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Protocol Fee</span>
            <span className="text-foreground font-data">{fees?.protocolFee} BTC</span>
          </div>
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
            <span className="font-medium text-foreground">Total Fees</span>
            <span className="font-medium text-foreground font-data">
              {totalFees?.toFixed(8)} BTC
            </span>
          </div>
        </div>
      </div>
      {/* Slippage Settings */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Slippage Tolerance</h4>
          <div className="flex items-center space-x-2">
            <Button
              variant={slippage === 0.1 ? "default" : "outline"}
              size="xs"
              onClick={() => setSlippage(0.1)}
            >
              0.1%
            </Button>
            <Button
              variant={slippage === 0.5 ? "default" : "outline"}
              size="xs"
              onClick={() => setSlippage(0.5)}
            >
              0.5%
            </Button>
            <Button
              variant={slippage === 1.0 ? "default" : "outline"}
              size="xs"
              onClick={() => setSlippage(1.0)}
            >
              1.0%
            </Button>
          </div>
        </div>
      </div>
      {/* Expected Output */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">You will receive</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-lg font-semibold text-foreground font-data">
                {estimatedOutput} WBTC
              </span>
              {selectedProtocol && (
                <span className="text-sm text-accent">
                  → {selectedProtocol?.name}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground">Expected APY</span>
            <div className="text-lg font-semibold text-success">
              {selectedProtocol?.apy || '0.00'}%
            </div>
          </div>
        </div>
      </div>
      {/* Deploy Button */}
      <Button
        variant="default"
        size="lg"
        fullWidth
        onClick={onDeploy}
        disabled={!canDeploy || isDeploying}
        loading={isDeploying}
        iconName="Rocket"
        iconPosition="left"
        className="mt-6 bg-gray-600 hover:bg-gray-700 disabled:cursor-not-allowed"
      >
        {isDeploying ? 'Deploying...' : selectedProtocol?.id === "troves-vault" ? 'Shuttle Yield Farming' : 'Shuttle Lending Interest '}
      </Button>
      {!canDeploy && amount && parseFloat(amount) > 0 && (
        <div className="flex items-center space-x-2 p-3 bg-warning/10 border border-warning/20 rounded-md">
          <Icon name="AlertTriangle" size={16} className="text-warning" />
          <span className="text-sm text-warning">
            {!selectedProtocol 
              ? 'Please select a yield protocol' 
              : parseFloat(amount) <= totalFees 
                ? 'Amount must be greater than total fees' :'Invalid transaction parameters'
            }
          </span>
        </div>
      )}
    </div>
  );
};

export default TransactionPreviewPanel;