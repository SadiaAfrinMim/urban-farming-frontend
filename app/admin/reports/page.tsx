'use client';

import Link from 'next/link';
import { CheckCircle, AlertCircle, User, MessageSquare, Flag } from 'lucide-react';
import { useReports, useResolveReport } from '../../hooks/useApi';
import toast from 'react-hot-toast';

interface Report {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reported: {
    id: string;
    name: string;
    email: string;
  };
  post?: {
    id: number;
    content?: string;
    postContent?: string;
  };
}

export default function AdminReportsPage() {
  const { data: reports = [], isLoading: loading, error, refetch } = useReports();
  const resolveReportMutation = useResolveReport();

  const handleResolve = async (reportId: string) => {
    try {
      await resolveReportMutation.mutateAsync(reportId);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">লোড হচ্ছে...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ত্রুটি</h2>
          <p className="text-gray-600">{error instanceof Error ? error.message : 'রিপোর্ট লোড করতে সমস্যা হয়েছে'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            রিফ্রেশ করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline">← এডমিন ড্যাশবোর্ডে ফিরে যান</Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-8">রিপোর্ট ম্যানেজমেন্ট</h1>

        {reports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Flag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">কোনো রিপোর্ট নেই</h3>
            <p className="text-gray-500">কোনো ইউজার রিপোর্ট করেনি।</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Report Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Flag className="w-6 h-6 text-red-600" />
                    </div>
                  </div>

                  {/* Report Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-gray-800">রিপোর্ট #{report.id.slice(-6)}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status === 'Resolved' ? 'রিসলভড' : 'পেন্ডিং'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-red-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">রিপোর্টকারী</span>
                        </div>
                        <p className="text-sm text-gray-800">{report.reporter.name}</p>
                        <p className="text-xs text-gray-600">{report.reporter.email}</p>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">রিপোর্ট করা হয়েছে</span>
                        </div>
                        <p className="text-sm text-gray-800">{report.reported.name}</p>
                        <p className="text-xs text-gray-600">{report.reported.email}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700">কারণ: </span>
                      <span className="text-sm text-gray-600">{report.reason}</span>
                    </div>

                    {report.post && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">পোস্ট কনটেন্ট</span>
                        </div>
                        <p className="text-sm text-gray-800 line-clamp-3">{report.post.content || report.post.postContent}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{formatDate(report.createdAt)}</span>
                      </div>

                      {report.status !== 'Resolved' && (
                        <button
                          onClick={() => handleResolve(report.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          রিসলভ করুন
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}