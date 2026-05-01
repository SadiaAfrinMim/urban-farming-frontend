import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';

interface Produce {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  availableQuantity: number;
  certificationStatus: string;
  image?: string;
  createdAt?: string;
}

interface DataTableProps {
  data: Produce[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ProductCard: React.FC<{ item: Produce; onEdit: (id: string) => void; onDelete: (id: string) => void }> = ({
  item,
  onEdit,
  onDelete
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const truncateDescription = (description?: string, maxLength: number = 100) => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-200">
      <div className="relative">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center border border-gray-600">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={item.certificationStatus} />
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-white line-clamp-2">{item.name}</h3>
          <span className="text-lg font-bold text-green-400 ml-2">৳{item.price}</span>
        </div>

        <p className="text-sm text-gray-400 mb-3">{item.category}</p>

        {item.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-300">
              {showFullDescription ? item.description : truncateDescription(item.description)}
            </p>
            {item.description.length > 100 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-xs text-green-400 hover:text-green-300 mt-1"
              >
                {showFullDescription ? 'কম দেখুন' : 'আরও দেখুন'}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">স্টক:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.availableQuantity < 10
                ? 'bg-red-900 text-red-300'
                : item.availableQuantity < 50
                ? 'bg-yellow-900 text-yellow-300'
                : 'bg-green-900 text-green-300'
            }`}>
              {item.availableQuantity}
            </span>
          </div>
          {item.createdAt && (
            <span className="text-xs text-gray-500">
              {(() => {
                try {
                  const date = new Date(item.createdAt);
                  return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US');
                } catch (error) {
                  return 'Invalid Date';
                }
              })()}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onEdit(item.id)}
            className="flex-1 bg-blue-900 text-blue-300 py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-blue-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            এডিট
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="flex-1 bg-red-900 text-red-300 py-2 px-4 rounded-lg hover:bg-red-800 transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            ডিলিট
          </button>
        </div>
      </div>
    </div>
  );
};

export const DataTable: React.FC<DataTableProps> = ({ data, onEdit, onDelete }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-green-900 rounded-full flex items-center justify-center mb-6 border border-green-700">
          <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">কোন প্রোডাক্ট নেই</h3>
        <p className="text-gray-400 mb-6">আপনার প্রথম প্রোডাক্ট যোগ করুন</p>
        <div className="text-sm text-gray-500">
          <p>প্রোডাক্ট যোগ করতে উপরের "প্রোডাক্ট যোগ করুন" বাটনে ক্লিক করুন</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data.map((item) => (
        <ProductCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};