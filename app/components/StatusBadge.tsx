import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'verified':
      case 'available':
      case 'healthy':
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
      case 'rejected':
      case 'booked':
      case 'occupied':
      case 'poor':
        return 'bg-red-100 text-red-800';
      case 'inactive':
      case 'unavailable':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'সক্রিয়';
      case 'approved':
        return 'অনুমোদিত';
      case 'pending':
        return 'অপেক্ষমান';
      case 'suspended':
        return 'সাসপেন্ডেড';
      case 'rejected':
        return 'প্রত্যাখ্যাত';
      case 'verified':
        return 'যাচাইকৃত';
      case 'available':
        return 'উপলব্ধ';
      case 'booked':
      case 'occupied':
        return 'বুক করা';
      case 'maintenance':
        return 'রক্ষণাবেক্ষণ';
      case 'inactive':
        return 'নিষ্ক্রিয়';
      case 'unavailable':
        return 'অনুপলব্ধ';
      case 'healthy':
      case 'good':
        return 'ভালো';
      case 'poor':
        return 'খারাপ';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyles(status)}`}>
      {getStatusText(status)}
    </span>
  );
};