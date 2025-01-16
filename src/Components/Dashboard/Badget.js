import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Wallet, CreditCard, Coins, DollarSign, PiggyBank, Receipt, Save } from 'lucide-react';
import Sidebar from './Sidebar';
import Footer from './Footer';

const BudgetTracker = () => {
  const [accounts, setAccounts] = useState(() => {
    const savedAccounts = localStorage.getItem('budgetAccounts');
    return savedAccounts ? JSON.parse(savedAccounts) : {
      bank: 0,
      mobileMoney: 0,
      cash: 0
    };
  });

  const [totalMoney, setTotalMoney] = useState(() => {
    const savedTotal = localStorage.getItem('totalMoney');
    return savedTotal ? parseFloat(savedTotal) : 0;
  });

  const [spendingLimit, setSpendingLimit] = useState(() => {
    const savedLimit = localStorage.getItem('spendingLimit');
    return savedLimit ? parseFloat(savedLimit) : 0;
  });

  const [availableBalance, setAvailableBalance] = useState(() => {
    const savedBalance = localStorage.getItem('availableBalance');
    return savedBalance ? parseFloat(savedBalance) : 0;
  });


  const [financialRecords, setFinancialRecords] = useState(() => {
    const savedRecords = localStorage.getItem('financialRecords');
    return savedRecords ? JSON.parse(savedRecords) : [];
  });

  useEffect(() => {
    const total = Object.values(accounts).reduce((sum, value) => sum + value, 0);
    setTotalMoney(total);
    localStorage.setItem('totalMoney', total.toString());
    localStorage.setItem('budgetAccounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    const newBalance = totalMoney - spendingLimit;
    setAvailableBalance(newBalance);
    localStorage.setItem('spendingLimit', spendingLimit.toString());
    localStorage.setItem('availableBalance', newBalance.toString());
  }, [spendingLimit, totalMoney]);

  const handleAccountChange = (account, value) => {
    const numValue = parseFloat(value) || 0;
    setAccounts(prev => ({
      ...prev,
      [account]: numValue
    }));
  };

  const handleSpendingLimitChange = (value) => {
    const limit = parseFloat(value) || 0;
    if (limit > totalMoney) {
      toast.error("Spending limit cannot exceed total money available!");
      return;
    }
    setSpendingLimit(limit);
  };

  const recordFinancialData = () => {
    const record = {
      id: Date.now(),
      date: new Date().toISOString(),
      accounts: { ...accounts },
      totalMoney,
      spendingLimit,
      availableBalance
    };

    setFinancialRecords(prev => {
      const newRecords = [...prev, record];
      localStorage.setItem('financialRecords', JSON.stringify(newRecords));
      return newRecords;
    });

    toast.success("Financial data recorded successfully!");
  };

  const getAccountIcon = (accountType) => {
    switch (accountType) {
      case 'bank':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'mobileMoney':
        return <Wallet className="w-5 h-5 text-green-600" />;
      case 'cash':
        return <Coins className="w-5 h-5 text-yellow-600" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-4 bg-gray-100 transition-all duration-300 overflow-y-auto h-auto pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
              <PiggyBank className="w-8 h-8 mr-2 text-blue-600" />
              Budget Tracker
            </h1>

            <div className="space-y-6">
              {/* Account Balances Section */}
              <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <DollarSign className="w-6 h-6 mr-2 text-gray-600" />
                  Account Balances
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(accounts).map(([account, balance]) => (
                    <div key={account} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        {getAccountIcon(account)}
                        <label className="block text-gray-700 font-medium ml-2" htmlFor={account}>
                          {account.charAt(0).toUpperCase() + account.slice(1)}
                        </label>
                      </div>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id={account}
                        type="number"
                        value={balance}
                        onChange={(e) => handleAccountChange(account, e.target.value)}
                        placeholder={`Enter ${account} balance`}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Total Money Section */}
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-blue-800">Total Money Available</h3>
                <p className="text-3xl font-bold text-blue-600">${totalMoney.toFixed(2)}</p>
              </div>

              {/* Spending Limit Section */}
              <section className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Receipt className="w-5 h-5 mr-2 text-purple-600" />
                  <label className="block text-gray-700 font-medium" htmlFor="spendingLimit">
                    Set Spending Limit
                  </label>
                </div>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  id="spendingLimit"
                  type="number"
                  value={spendingLimit}
                  onChange={(e) => handleSpendingLimitChange(e.target.value)}
                  placeholder="Enter spending limit"
                />
              </section>

              {/* Available Balance After Spending */}
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold text-green-800">Available Balance After Spending</h3>
                <p className="text-3xl font-bold text-green-600">${availableBalance.toFixed(2)}</p>
              </div>

              {/* Record Button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={recordFinancialData}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Record Financial Data
                </button>
              </div>

              {/* Recent Records */}
              {financialRecords.length > 0 && (
                <section className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Recent Records</h2>
                  <div className="space-y-2">
                    {financialRecords.slice(-3).reverse().map(record => (
                      <div key={record.id} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600">
                          Recorded on: {new Date(record.date).toLocaleDateString()}
                        </p>
                        <p className="font-medium">Total Money: ${record.totalMoney.toFixed(2)}</p>
                        <p className="font-medium">Spending Limit: ${record.spendingLimit.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
      <Footer />
    </div>
  );
};

export default BudgetTracker;