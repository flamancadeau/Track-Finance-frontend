import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PlusCircle, Edit2, Trash2, DollarSign, X } from 'lucide-react';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    dateTime: '',
    account: 'bank',
    category: 'food',
    subcategory: 'groceries'
  });
  const [editId, setEditId] = useState(null);
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    const limit = localStorage.getItem('spendingLimit');
    if (limit) {
      setSpendingLimit(parseFloat(limit));
    }
    const expenseSum = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    setTotalExpenses(expenseSum);
  }, [transactions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);

    if (formData.type === 'expense') {
      const newTotalExpenses = totalExpenses + amount;
      if (newTotalExpenses > spendingLimit) {
        toast.error("Transaction exceeds spending limit! Remaining budget: $" + (spendingLimit - totalExpenses).toFixed(2));
        return;
      }
    }

    if (editId) {
      setTransactions(prevTransactions =>
        prevTransactions.map(transaction =>
          transaction.id === editId ? { ...transaction, ...formData } : transaction
        )
      );
      setEditId(null);
      toast.success("Transaction updated successfully!");
    } else {
      setTransactions(prevTransactions => [...prevTransactions, { ...formData, id: Date.now() }]);
      toast.success("Transaction added successfully!");
    }

    setFormData({
      type: 'income',
      amount: '',
      dateTime: '',
      account: 'bank',
      category: 'food',
      subcategory: 'groceries'
    });
    setIsModalOpen(false);
  };

  const handleEdit = (transaction) => {
    setFormData(transaction);
    setEditId(transaction.id);
    setIsModalOpen(true);
    toast.info("Editing transaction");
  };

  const handleDelete = (id) => {
    setTransactions(prevTransactions => prevTransactions.filter(transaction => transaction.id !== id));
    toast.success("Transaction deleted successfully!");
  };

  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto- bg-black bg-opacity-50 flex items-center justify-center">
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header with Stats and Add Button */}
            <div className="flex justify-between items-center mb-6">
              <div className="grid grid-cols-3 gap-4 flex-1">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700">Spending Limit</h3>
                  <p className="text-lg font-bold text-blue-600">${spendingLimit.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700">Total Expenses</h3>
                  <p className="text-lg font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700">Remaining Budget</h3>
                  <p className="text-lg font-bold text-green-600">${(spendingLimit - totalExpenses).toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditId(null);
                  setFormData({
                    type: 'income',
                    amount: '',
                    dateTime: '',
                    account: 'bank',
                    category: 'food',
                    subcategory: 'groceries'
                  });
                  setIsModalOpen(true);
                }}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Transaction
              </button>
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
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                            ${parseFloat(transaction.amount).toFixed(2)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.dateTime).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transaction.account}</td>
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
                            onClick={() => handleDelete(transaction.id)}
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
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Date and Time</label>
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
                  <option value="bank">Bank Account</option>
                  <option value="mobile">Mobile Money</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="food">Food</option>
                  <option value="transportation">Transportation</option>
                  <option value="utilities">Utilities</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="healthcare">Healthcare</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Subcategory</label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="groceries">Groceries</option>
                  <option value="restaurants">Restaurants</option>
                  <option value="fastfood">Fast Food</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="mr-3 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editId ? 'Update Transaction' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </Modal>

        <Footer />
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Transaction;