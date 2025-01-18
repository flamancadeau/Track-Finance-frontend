import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { PlusCircle, Edit2, Trash2, DollarSign, X, AlertCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import axios from 'axios';

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    dateTime: new Date().toISOString().slice(0, 16),
    account: 'bank',
    category: '',
    subcategory: ''
  });
  const [editId, setEditId] = useState(null);
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [accounts, setAccounts] = useState({
    bank: 0,
    mobile: 0,
    cash: 0
  });
  const [totalMoney, setTotalMoney] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch budget data
  const fetchBudgetData = async () => {
    try {
      const response = await axios.get('https://track-finance-backend-production.up.railway.app/api/badget');
      const data = response.data;

      if (data && data.budget) {
        if (data.budget.accounts) {
          setAccounts(data.budget.accounts);
        }
        if (typeof data.budget.spendingLimit === 'number') {
          setSpendingLimit(data.budget.spendingLimit);
        }
        if (typeof data.budget.totalMoney === 'number') {
          setTotalMoney(data.budget.totalMoney);
        }
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
      toast.error('Failed to fetch budget data');
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const response = await axios.get('https://track-finance-backend-production.up.railway.app/api/getTransactions');
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    }
  };

  useEffect(() => {
    fetchBudgetData();
    fetchTransactions();
  }, []);

  useEffect(() => {
    const expenseSum = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    setTotalExpenses(expenseSum);
  }, [transactions]);

  // Update budget
  const updateBudget = async (type, amount, account) => {
    const newAccounts = { ...accounts };
    if (type === 'income') {
      newAccounts[account] += parseFloat(amount);
    } else {
      newAccounts[account] -= parseFloat(amount);
    }

    const newTotalMoney = Object.values(newAccounts).reduce((sum, value) => sum + value, 0);
    let newSpendingLimit = spendingLimit;
    if (type === 'expense') {
      newSpendingLimit -= parseFloat(amount);
    }

    try {
      await axios.post('https://track-finance-backend-production.up.railway.app/api/badget', {
        accounts: newAccounts,
        spendingLimit: newSpendingLimit,
        totalMoney: newTotalMoney
      });
      setAccounts(newAccounts);
      setTotalMoney(newTotalMoney);
      setSpendingLimit(newSpendingLimit);
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    }
  };

  // Handle input changes with debounced validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission with basic validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.dateTime || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);

    // Check if there's enough balance for expenses
    if (formData.type === 'expense') {
      if (amount > accounts[formData.account]) {
        toast.error(`Insufficient funds in ${formData.account} account`);
        setIsSubmitting(false);
        return;
      }

      const newTotalExpenses = totalExpenses + amount;
      if (newTotalExpenses > spendingLimit && !editId) {
        toast.error("Transaction exceeds spending limit! Remaining budget: $" + (spendingLimit - totalExpenses).toFixed(2));
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (editId) {
        // Handle edit transaction
        const oldTransaction = transactions.find(t => t._id === editId);
        await updateBudget(
          oldTransaction.type === 'income' ? 'expense' : 'income',
          oldTransaction.amount,
          oldTransaction.account
        );

        const response = await axios.put(`https://track-finance-backend-production.up.railway.app/api/updateTransaction/${editId}`, formData);
        const updatedTransaction = response.data.transaction;

        setTransactions(prevTransactions =>
          prevTransactions.map(transaction =>
            transaction._id === editId ? updatedTransaction : transaction
          )
        );

        await updateBudget(formData.type, amount, formData.account);
        toast.success("Transaction updated successfully!");
        setEditId(null);
      } else {
        // Handle new transaction
        const response = await axios.post('https://track-finance-backend-production.up.railway.app/api/createTransaction', formData);
        setTransactions(prevTransactions => [...prevTransactions, response.data.transaction]);
        await updateBudget(formData.type, amount, formData.account);
        toast.success("Transaction added successfully!");
      }

      // Reset form and refresh data
      setFormData({
        type: 'income',
        amount: '',
        dateTime: new Date().toISOString().slice(0, 16),
        account: 'bank',
        category: '',
        subcategory: ''
      });
      fetchTransactions();
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Failed to submit transaction. Please try again');
      console.error('Error submitting transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit transaction
  const handleEdit = (transaction) => {
    setFormData({
      ...transaction,
      dateTime: new Date(transaction.dateTime).toISOString().slice(0, 16)
    });
    setEditId(transaction._id);
    setIsModalOpen(true);
    toast.info("Editing transaction");
  };

  // Handle delete transaction
  const handleDelete = async (id) => {
    try {
      const transaction = transactions.find(t => t._id === id);
      if (!transaction) {
        toast.error('Transaction not found');
        return;
      }

      await updateBudget(
        transaction.type === 'income' ? 'expense' : 'income',
        transaction.amount,
        transaction.account
      );

      await axios.delete(`https://track-finance-backend-production.up.railway.app/api/deleteTransaction/${id}`);
      setTransactions(prevTransactions => prevTransactions.filter(t => t._id !== id));
      toast.success("Transaction deleted successfully!");
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  // Modal component
  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden h-auto pb-24">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header with Stats */}
            <div className="flex justify-between items-center mb-6">
              <div className="grid md:grid-cols-3 gap-4 flex-1">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700">Total Money Available</h3>
                  <p className="text-lg font-bold text-blue-600">${totalMoney.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700">Total Expenses</h3>
                  <p className={`text-lg font-bold ${totalExpenses > spendingLimit ? 'text-red-600' : 'text-gray-600'}`}>
                    ${totalExpenses.toFixed(2)}
                    {totalExpenses > spendingLimit && (
                      <AlertCircle className="inline-block ml-2 text-red-600 w-5 h-5" />
                    )}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700">Remaining Budget</h3>
                  <p className={`text-lg font-bold ${(spendingLimit - totalExpenses) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${(spendingLimit - totalExpenses).toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditId(null);
                  setFormData({
                    type: 'income',
                    amount: '',
                    dateTime: new Date().toISOString().slice(0, 16),
                    account: 'bank',
                    category: '',
                    subcategory: ''
                  });
                  setIsModalOpen(true);
                }}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Transaction
              </button>
            </div>

            {/* Account Balances */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {Object.entries(accounts).map(([account, balance]) => (
                <div key={account} className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 capitalize">
                    {account === 'mobile' ? 'mobile Money' : account}
                  </h3>
                  <p className="text-lg font-bold text-gray-600">${balance.toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subcategory</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map(transaction => (
                      <tr key={transaction._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            ${parseFloat(transaction.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.dateTime).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {transaction.account === 'mobile' ? 'MobileMoney' : transaction.account}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transaction.subcategory}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Form Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} className="p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-blue-600" />
              {editId ? 'Edit Transaction' : 'New Transaction'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    name="amount"
                    id='amount'
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full pl-8 border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Account</label>
                <select
                  name="account"
                  value={formData.account}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bank">Bank</option>
                  <option value="mobile">Mobile Money</option>
                  <option value="cash">Cash</option>
                </select>
                {formData.type === 'expense' && (
                  <p className="mt-1 text-sm text-gray-500">
           
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="e.g., Food, Transport, Salary"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Subcategory</label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Groceries, Bus, Bonus"
                />
              </div>
            </div>

            {formData.type === 'expense' && spendingLimit > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  Spending Limit Remaining: ${(spendingLimit - totalExpenses).toFixed(2)}
                </p>
                {parseFloat(formData.amount) > accounts[formData.account] && (
                  <p className="text-sm text-red-600 mt-1">
                    Warning: Amount exceeds available balance in selected account
                  </p>
                )}
                {(totalExpenses + parseFloat(formData.amount || 0)) > spendingLimit && (
                  <p className="text-sm text-red-600 mt-1">
                    Warning: This transaction will exceed your spending limit please increase your limit
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-white rounded-md hover:bg-blue-700 ${isSubmitting ? "bg-gray-600" : "bg-blue-600"}`}
                disabled={isSubmitting}
              >
                {
                  isSubmitting ? "Loading..." : editId ? "Update Transaction" : "Add Transaction"
                }
              </button>
            </div>
          </form>
        </Modal>

        <Footer />
      </div>
      <ToastContainer />
    </div>
  );
};

export default Transaction;