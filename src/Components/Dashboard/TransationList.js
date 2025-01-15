import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { PlusCircle, Edit2, Trash2, List, Tag, Tags } from 'lucide-react';
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.category && formData.subcategory) {
      if (editingId) {
        setTransactions((prevTransactions) =>
          prevTransactions.map((transaction) =>
            transaction.id === editingId
              ? { ...transaction, ...formData }
              : transaction
          )
        );
        setEditingId(null);
        toast.success('Category updated successfully!');
      } else {
        setTransactions((prevTransactions) => [
          ...prevTransactions,
          { ...formData, id: Date.now() },
        ]);
        toast.success('New category added successfully!');
      }
      setFormData({ category: '', subcategory: '' });
      setIsModalOpen(false);
    }
  };

  const handleEdit = (id) => {
    const transaction = transactions.find((t) => t.id === id);
    if (transaction) {
      setFormData({
        category: transaction.category,
        subcategory: transaction.subcategory,
      });
      setEditingId(id);
      setIsModalOpen(true);
      toast.info('Editing category...');
    }
  };

  const handleDelete = (id) => {
    setTransactions((prevTransactions) =>
      prevTransactions.filter((transaction) => transaction.id !== id)
    );
    toast.success('Category deleted successfully!');
  };

  const handleCloseModal = () => {
    setFormData({ category: '', subcategory: '' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                <List className="w-8 h-8 mr-2 text-blue-600" />
                Transaction Categories
              </h2>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center px-6 py-2 mb-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add New Category
              </button>

              {/* Categories Table */}
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subcategory
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Tag className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {transaction.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Tags className="w-5 h-5 text-green-600 mr-2" />
                            <span className="text-sm text-gray-500">
                              {transaction.subcategory}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(transaction.id)}
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="inline-flex items-center text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {editingId ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
                    Subcategory
                  </label>
                  <input
                    id="subcategory"
                    name="subcategory"
                    type="text"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingId ? 'Update' : 'Add'}
                  </button>
                </div>
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
