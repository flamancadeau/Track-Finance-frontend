import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { PlusCircle, Edit2, Trash2, List, Tag, Tags } from 'lucide-react'; // Importing all icons
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('https://track-finance-backend-production.up.railway.app/api/transactionList');
        const data = await response.json();

        if (response.ok) {
          setTransactions(data.transactions);
          toast.success(data.message || 'Transactions loaded successfully!');
        } else {
          toast.error(data.message || 'Failed to load transactions');
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('An error occurred while fetching transactions');
      }
    };

    fetchTransactions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.category && formData.subcategory) {
      try {
        if (editingId) {
          const response = await fetch(`https://track-finance-backend-production.up.railway.app/api/transactionList/${editingId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });

          const data = await response.json();

          if (response.ok) {
            setTransactions((prevTransactions) =>
              prevTransactions.map((transaction) =>
                transaction._id === editingId ? data.transaction : transaction
              )
            );
            toast.success(data.message || 'Transaction updated successfully!');
            setEditingId(null);
          } else {
            toast.error(data.message || 'Failed to update transaction');
          }
        } else {
          const response = await fetch('https://track-finance-backend-production.up.railway.app/api/transactionList', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });

          const data = await response.json();

          if (response.ok) {
            setTransactions((prevTransactions) => [...prevTransactions, data.transaction]);
            toast.success(data.message || 'Transaction created successfully!');
          } else {
            toast.error(data.message || 'Failed to create transaction');
          }
        }

        setFormData({ category: '', subcategory: '' });
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error submitting transaction:', error);
        toast.error('An error occurred while submitting the transaction');
      }
    }
  };

  const handleAdd = () => {
    setFormData({ category: '', subcategory: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id) => {
    const transaction = transactions.find((t) => t._id === id);
    if (transaction) {
      setFormData({ category: transaction.category, subcategory: transaction.subcategory });
      setEditingId(id);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setFormData({ category: '', subcategory: '' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://track-finance-backend-production.up.railway.app/api/transactionList/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setTransactions((prevTransactions) =>
          prevTransactions.filter((transaction) => transaction._id !== id)
        );
        toast.success(data.message || 'Transaction deleted successfully!');
      } else {
        toast.error(data.message || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('An error occurred while deleting the transaction');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-y-auto h-auto pb-24">
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                <List className="w-8 h-8 mr-2 text-blue-600" />
                Transaction Categories
              </h2>

              <button
                onClick={handleAdd}
                className="flex items-center px-6 py-2 mb-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add New Category
              </button>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Tag className="w-4 h-4 inline mr-1 text-gray-600" />
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <Tags className="w-4 h-4 inline mr-1 text-gray-600" />
                        Subcategory
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{transaction.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{transaction.subcategory}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(transaction._id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center text-gray-500 py-8">
                          No categories added yet. Start by adding a new category above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-96">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-700">
                {editingId ? 'Edit Transaction' : 'Add New Transaction'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Tag className="w-4 h-4 inline mr-1 text-gray-600" />
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="subcategory"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  <Tags className="w-4 h-4 inline mr-1 text-gray-600" />
                  Subcategory
                </label>
                <input
                  type="text"
                  id="subcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default TransactionList;
