import React, { useState, useEffect } from 'react';
import {  TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Footer from './Footer';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
    {children}
  </div>
);

const Home = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgetData, setBudgetData] = useState({
    accounts: { bank: 0, mobile: 0, cash: 0 },
    spendingLimit: 0,
    totalMoney: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsRes, budgetRes] = await Promise.all([
          axios.get('https://track-finance-backend-production.up.railway.app/api/getTransactions'),
          axios.get('https://track-finance-backend-production.up.railway.app/api/badget')
        ]);
        
        setTransactions(transactionsRes.data.transactions);
        setBudgetData(budgetRes.data.budget);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []);

  // Calculate summary statistics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Prepare data for category analysis
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
      return acc;
    }, {});

  // Prepare monthly trend data
  const monthlyData = transactions.reduce((acc, t) => {
    const month = new Date(t.dateTime).toLocaleString('default', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { month, income: 0, expenses: 0 };
    }
    if (t.type === 'income') {
      acc[month].income += parseFloat(t.amount);
    } else {
      acc[month].expenses += parseFloat(t.amount);
    }
    return acc;
  }, {});

  const monthlyTrendData = Object.values(monthlyData);

  // Chart configurations
  const lineChartData = {
    labels: monthlyTrendData.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyTrendData.map(d => d.income),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Expenses',
        data: monthlyTrendData.map(d => d.expenses),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Income vs Expenses'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(251, 191, 36, 0.8)'
        ],
        borderColor: 'white',
        borderWidth: 2
      }
    ]
  };

  const accountsBarData = {
    labels: ['Bank', 'Mobile Money', 'Cash'],
    datasets: [
      {
        label: 'Account Balance',
        data: [
          budgetData.accounts.bank,
          budgetData.accounts.mobile,
          budgetData.accounts.cash
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)'
        ]
      }
    ]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Account Distribution'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Financial Dashboard</h1>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Balance</p>
                  <p className="text-2xl font-bold">${budgetData.totalMoney.toFixed(2)}</p>
                </div>
                <PiggyBank className="h-8 w-8 text-blue-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Spending Limit</p>
                  <p className="text-2xl font-bold text-purple-600">${budgetData.spendingLimit.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend Line Chart */}
            <Card>
              <div className="h-[400px] w-full">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </Card>

            {/* Account Distribution Bar Chart */}
            <Card>
              <div className="h-[400px] w-full">
                <Bar data={accountsBarData} options={barOptions} />
              </div>
            </Card>

            {/* Expense Categories Doughnut */}
            <Card>
              <div className="h-[400px] w-full flex justify-center items-center">
                <div className="w-4/5 h-4/5">
                  <Doughnut 
                    data={doughnutData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'right'
                        },
                        title: {
                          display: true,
                          text: 'Expense Categories'
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Budget Progress Card */}
            <Card>
              <h3 className="text-lg font-semibold mb-6">Budget Usage</h3>
              <div className="relative pt-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    Budget Usage ({((totalExpenses / budgetData.spendingLimit) * 100).toFixed(1)}%)
                  </span>
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    ${totalExpenses.toFixed(2)} / ${budgetData.spendingLimit.toFixed(2)}
                  </span>
                </div>
                <div className="overflow-hidden h-6 mb-4 text-xs flex rounded-full bg-blue-200">
                  <div
                    style={{ width: `${Math.min((totalExpenses / budgetData.spendingLimit) * 100, 100)}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      totalExpenses > budgetData.spendingLimit ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                  />
                </div>
                <div className="text-center mt-8">
                  <p className="text-sm text-gray-600">
                    Remaining Budget:
                    <span className={`font-bold ml-2 ${
                      totalExpenses > budgetData.spendingLimit ? 'text-red-500' : 'text-green-500'
                    }`}>
                      ${Math.max(budgetData.spendingLimit - totalExpenses, 0).toFixed(2)}
                    </span>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;