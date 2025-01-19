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

  // Get date range based on report type
  const getDateRange = (type) => {
    const today = new Date();
    let startDate = new Date();

    switch (type) {
      case 'weekly':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'monthly':
        startDate.setDate(today.getDate() - 30);
        break;
      case 'yearly':
        startDate.setDate(today.getDate() - 365);
        break;
      default:
        return { start: '', end: '' };
    }

    return {
      start: startDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  };

  // Handle report type change
  const handleReportTypeChange = (e) => {
    const newReportType = e.target.value;
    setReportType(newReportType);

    if (newReportType !== 'custom' && newReportType !== 'all') {
      const { start, end } = getDateRange(newReportType);
      setStartDate(start);
      setEndDate(end);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  // Format date for API
  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString();
  };

  // Handle generate report
  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate dates for custom period
      if (reportType === 'custom' && (!startDate || !endDate)) {
        throw new Error('Please select both start and end dates for custom period');
      }

      let queryStartDate = '';
      let queryEndDate = '';

      if (reportType === 'custom') {
        queryStartDate = formatDateForAPI(startDate);
        // Set end date to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        queryEndDate = endDateTime.toISOString();
      } else if (reportType !== 'all') {
        const { start, end } = getDateRange(reportType);
        queryStartDate = formatDateForAPI(start);
        const endDateTime = new Date(end);
        endDateTime.setHours(23, 59, 59, 999);
        queryEndDate = endDateTime.toISOString();
      }

      // Construct API URL with query parameters
      let apiUrl = 'https://track-finance-backend-production.up.railway.app/api/DateTransactions';
      const params = new URLSearchParams();

      if (queryStartDate && queryEndDate) {
        params.append('startDate', queryStartDate);
        params.append('endDate', queryEndDate);
      }

      if (accountType !== 'all') {
        params.append('accountType', accountType);
      }

      if (params.toString()) {
        apiUrl += `?${params.toString()}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Filter and sort transactions
      let processedData = Array.isArray(data) ? data : [];
      
      if (queryStartDate && queryEndDate) {
        const startTimestamp = new Date(queryStartDate).getTime();
        const endTimestamp = new Date(queryEndDate).getTime();
        
        processedData = processedData.filter(transaction => {
          const transactionDate = new Date(transaction.dateTime).getTime();
          return transactionDate >= startTimestamp && transactionDate <= endTimestamp;
        });
      }

      // Sort by date descending
      processedData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

      setFilteredTransactions(processedData);
    } catch (err) {
      setError(err.message || 'Error fetching data');
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

                {(reportType === 'custom') && (
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
                        max={endDate || undefined}
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
                        min={startDate || undefined}
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

              {/* Generate Report Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>

            {/* Loading or Error Messages */}
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading...</p>
              </div>
            )}
            {error && (
              <div className="text-center text-red-500 bg-red-50 p-4 rounded-md mb-6">
                {error}
              </div>
            )}

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