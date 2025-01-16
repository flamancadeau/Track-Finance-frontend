import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import Sidebar from './Sidebar';
import Footer from './Footer';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const accountData = {
  bank: 5000,
  mobileMoney: 1000,
  cash: 500
};

const transactionCounts = {
  income: 10,
  expense: 25
};

const budgetData = {
  food: { limit: 500, spent: 350 },
  transportation: { limit: 300, spent: 200 },
  entertainment: { limit: 200, spent: 180 },
  utilities: { limit: 400, spent: 380 }
};

const Home = () => {
  const accountChartData = {
    labels: ['Bank', 'Mobile Money', 'Cash'],
    datasets: [
      {
        data: Object.values(accountData),
        backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b'],
        hoverBackgroundColor: ['#16a34a', '#2563eb', '#d97706']
      }
    ]
  };

  const transactionChartData = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        data: Object.values(transactionCounts),
        backgroundColor: ['#22c55e', '#ef4444'],
        hoverBackgroundColor: ['#16a34a', '#dc2626']
      }
    ]
  };

  const budgetChartData = {
    labels: Object.keys(budgetData),
    datasets: [
      {
        label: 'Spent',
        data: Object.values(budgetData).map(item => item.spent),
        backgroundColor: '#3b82f6',
        barThickness: 20
      },
      {
        label: 'Limit',
        data: Object.values(budgetData).map(item => item.limit),
        backgroundColor: '#f59e0b',
        barThickness: 20
      }
    ]
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 8,
          font: {
            size: 11
          }
        }
      }
    }
  };

  const budgetChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 11 }
        },
        grid: {
          display: false
        }
      },
      x: {
        ticks: {
          font: { size: 11 }
        },
        grid: {
          display: false
        }
      }
    },
    maintainAspectRatio: false
  };

  const getBudgetColor = (spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 h-auto overflow-y-auto pb-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Financial Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Account Balances</h2>
              <div className="h-40">
                <Doughnut data={accountChartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Transaction Overview</h2>
              <div className="h-40">
                <Doughnut data={transactionChartData} options={chartOptions} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Budget Overview</h2>
              <div className="h-40">
                <Bar data={budgetChartData} options={budgetChartOptions} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(budgetData).map(([category, data]) => (
              <div key={category} className="bg-white rounded-lg shadow-sm p-3">
                <h3 className="text-xs font-semibold capitalize text-gray-900 mb-2">{category}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Spent: ${data.spent}</span>
                    <span className="text-gray-600">Limit: ${data.limit}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div
                        className={`h-full rounded-full transition-all ${getBudgetColor(data.spent, data.limit)}`}
                        style={{ width: `${Math.min((data.spent / data.limit) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      {Math.round((data.spent / data.limit) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;