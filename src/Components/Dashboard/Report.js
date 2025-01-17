import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Calendar, Filter, FileText, RefreshCw, Filter as FilterIcon, TrendingUp, TrendingDown } from 'lucide-react';
import Footer from './Footer';

const Report = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [accountType, setAccountType] = useState('all');
  const [reportType, setReportType] = useState('all');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate totals from filtered transactions
  const calculateTotals = () => {
    return filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.totalIncome += transaction.amount;
        } else {
          acc.totalExpense += transaction.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 }
    );
  };

  // Handle report type change
  const handleReportTypeChange = (e) => {
    const newReportType = e.target.value;
    setReportType(newReportType);
    
    // Clear custom dates when switching to preset periods
    if (newReportType !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Handle search with updated filters
  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      // Construct query parameters
      const queryParams = new URLSearchParams();
      
      // Add report type if not custom
      if (reportType !== 'custom') {
        queryParams.append('reportType', reportType);
      }
      
      // Add date range if custom period or dates are set
      if ((reportType === 'custom' || reportType === 'all') && startDate && endDate) {
        queryParams.append('startDate', startDate);
        queryParams.append('endDate', endDate);
      }
      
      // Add account type
      if (accountType !== 'all') {
        queryParams.append('accountType', accountType);
      }

      const response = await fetch(`https://track-finance-backend-production.up.railway.app/api/DateTransactions?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      setFilteredTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error fetching data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get the calculated totals
  const { totalIncome, totalExpense } = calculateTotals();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 ml-15 transition-all duration-300 overflow-y-auto h-auto pb-24">
        <div className="p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800">Financial Report</h1>
            </div>

            {/* Totals Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Income</p>
                      <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingDown className="w-8 h-8 text-red-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-600">${totalExpense.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 text-sm font-semibold">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={handleReportTypeChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="all">All Time</option>
                    <option value="weekly">Last 7 Days</option>
                    <option value="monthly">Last 30 Days</option>
                    <option value="yearly">Last 365 Days</option>
                    <option value="custom">Custom Period</option>
                  </select>
                </div>

                {(reportType === 'custom' || reportType === 'all') && (
                  <>
                    <div className="space-y-2">
                      <label className="flex items-center text-gray-700 text-sm font-semibold">
                        <Calendar className="w-4 h-4 mr-1" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center text-gray-700 text-sm font-semibold">
                        <Calendar className="w-4 h-4 mr-1" />
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="flex items-center text-gray-700 text-sm font-semibold">
                    <FilterIcon className="w-4 h-4 mr-1" />
                    Account Type
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <option value="all">All</option>
                    <option value="bank">Bank</option>
                    <option value="mobile">Mobile Money</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleSearch}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Generate Report
                </button>
              </div>
            </div>

            {/* Loading or Error Messages */}
            {loading && <p className="text-center text-gray-500">Loading...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Account</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subcategory</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.dateTime).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.account}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.category}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.subcategory}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Report;