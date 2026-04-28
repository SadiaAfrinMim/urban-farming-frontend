import React from 'react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg overflow-hidden shadow-xl hover:shadow-2xl rounded-3xl border border-gray-200/50 hover:-translate-y-2 transition-all duration-300 group">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-600 mb-1 group-hover:text-gray-700 transition-colors">{title}</dt>
              <dd className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-green-600 group-hover:to-blue-600 transition-all duration-300">
                {value}
              </dd>
            </dl>
          </div>
          <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>

        {/* Decorative element */}
        <div className="mt-4 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};