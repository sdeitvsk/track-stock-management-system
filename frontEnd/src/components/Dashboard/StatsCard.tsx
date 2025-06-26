
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'pink';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      text: 'text-blue-600',
      icon: 'from-blue-500 to-cyan-500'
    },
    green: {
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      text: 'text-green-600',
      icon: 'from-green-500 to-emerald-500'
    },
    yellow: {
      gradient: 'from-yellow-500 to-orange-500',
      bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      text: 'text-yellow-600',
      icon: 'from-yellow-500 to-orange-500'
    },
    red: {
      gradient: 'from-red-500 to-pink-500',
      bg: 'bg-gradient-to-br from-red-50 to-pink-50',
      text: 'text-red-600',
      icon: 'from-red-500 to-pink-500'
    },
    purple: {
      gradient: 'from-purple-500 to-indigo-500',
      bg: 'bg-gradient-to-br from-purple-50 to-indigo-50',
      text: 'text-purple-600',
      icon: 'from-purple-500 to-indigo-500'
    },
    pink: {
      gradient: 'from-pink-500 to-rose-500',
      bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
      text: 'text-pink-600',  
      icon: 'from-pink-500 to-rose-500'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} rounded-2xl p-6 shadow-lg border border-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
          {trend && (
            <div className="flex items-center">
              <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                trend.isPositive 
                  ? 'text-green-700 bg-green-100' 
                  : 'text-red-700 bg-red-100'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-sm text-slate-500 ml-2">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors.icon} shadow-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
