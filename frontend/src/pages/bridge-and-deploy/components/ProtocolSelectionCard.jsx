import React from 'react';
import Icon from '../../../components/AppIcon';
import { useNavigate } from 'react-router-dom';

const ProtocolSelectionCard = ({ 
  protocol, 
  isSelected, 
  onSelect 
}) => {
  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low':
        return 'text-success bg-success/10';
      case 'medium':
        return 'text-warning bg-warning/10';
      case 'high':
        return 'text-error bg-error/10';
      default:
        return 'text-white bg-muted';
    }
  };

  const getProtocolIcon = (type) => {
    switch (type) {
      case 'vault':
        return 'Vault';
      case 'lending':
        return 'Coins';
      default:
        return 'DollarSign';
    }
  };

  const navigate= useNavigate();

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-smooth ${
        isSelected
          ? 'border-accent bg-accent/5 shadow-md'
          : 'border-border bg-card hover:border-accent/50 hover:bg-accent/2'
      }`}
      onClick={() => onSelect(protocol)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isSelected ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'
          }`}>
            <Icon name={getProtocolIcon(protocol?.type)} size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-foreground font-heading">
              {protocol?.name}
            </h4>
            <p className="text-sm text-muted-foreground">
              {protocol?.description}
            </p>
          </div>
        </div>
        
        {isSelected && (
          <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
            <Icon name="Check" size={14} color="white" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="flex items-center space-x-1 mb-1">
            <Icon name="TrendingUp" size={14} className="text-accent" />
            <span className="text-xs text-muted-foreground">Current Interest Rate</span>
          </div>
          <span className="text-lg font-semibold text-foreground font-data">
            {protocol?.interestRate}%
          </span>
        </div>
        
        <div>
          <div className="flex items-center space-x-1 mb-1">
            <Icon name="Shield" size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Risk Detail</span>
          </div>
          <span onClick={() => navigate(protocol?.risk)} className={`text-xs px-2 py-1 rounded-full font-medium ${getRiskColor(protocol?.risk)}`}>
            {protocol?.risk.slice(0,15) + "..." + protocol?.risk.slice(20,30)}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Borrow APR</span>
          <span className="text-foreground font-medium">
            {protocol?.borrowedApr} WBTC
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Reserves</span>
          <span className="text-foreground font-medium">
            {protocol?.reserve} WBTC
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Max Utilization</span>
          <span className="text-foreground font-medium">
            {protocol?.maxUtilization} WBTC
          </span>
        </div>
      </div>
      {protocol?.features && protocol?.features?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex flex-wrap gap-1">
            {protocol?.features?.map((feature, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtocolSelectionCard;