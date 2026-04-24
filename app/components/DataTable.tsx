import React from 'react';
import { StatusBadge } from './StatusBadge';

interface Produce {
  id: string;
  name: string;
  category: string;
  price: number;
  availableQuantity: number;
  certificationStatus: string;
}

interface DataTableProps {
  data: Produce[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ data, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.price}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.availableQuantity}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={item.certificationStatus} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onClick={() => onEdit(item.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};