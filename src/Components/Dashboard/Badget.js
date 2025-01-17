import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Wallet, CreditCard, Coins, DollarSign, PiggyBank, Save, PlusCircle, X } from "lucide-react";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const BudgetTracker = () => {
  const [accounts, setAccounts] = useState({
    bank: 0,
    mobileMoney: 0,
    cash: 0,
  });
  const [spendingLimit, setSpendingLimit] = useState(0);
  const [totalMoney, setTotalMoney] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    bank: "",
    mobileMoney: "",
    cash: "",
  });
  const [newSpendingLimit, setNewSpendingLimit] = useState("");

  // Calculate Total Money
  useEffect(() => {
    const total = Object.values(accounts).reduce((sum, value) => sum + value, 0);
    setTotalMoney(total);
  }, [accounts]);

  // Fetch budget data from the API on component mount
  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const response = await fetch("https://track-finance-backend-production.up.railway.app/api/badget");
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        console.log("data", data);

        if (data && data.budget && data.budget.accounts && typeof data.budget.accounts === 'object') {
          setAccounts(data.budget.accounts);
        } else {
          toast.error("Invalid data format received from the server.");
        }

        if (data.budget.spendingLimit !== undefined) {
          setSpendingLimit(data.budget.spendingLimit);
        } else {
          toast.error("Spending limit not found in the response.");
        }

        if (data.budget.totalMoney !== undefined) {
          setTotalMoney(data.budget.totalMoney);
        } else {
          toast.error("Total money not found in the response.");
        }
      } catch (error) {
        toast.error("Error fetching budget data: " + error.message);
      }
    };
    fetchBudgetData();
  }, []);





  // Handle Modal Account Data Change
  const handleNewAccountChange = (account, value) => {
    setNewAccount((prev) => ({
      ...prev,
      [account]: value || "",
    }));
  };

  const handleNewSpendingLimitChange = (value) => {
    setNewSpendingLimit(value || "");
  };

  // Toggle Modal
  const toggleModal = () => {
    setShowModal((prev) => !prev);
  };

  // Handle Submit for Adding Accounts and Spending Limit
  const handleAddAccounts = async () => {
    const numSpendingLimit = parseFloat(newSpendingLimit) || spendingLimit;
    if (!newAccount.bank && !newAccount.mobileMoney && !newAccount.cash) {
      toast.error("Please fill at least one account field!");
      return;
    }

    const newTotalMoney = Object.values(newAccount).reduce(
      (sum, value) => sum + (parseFloat(value) || 0),
      totalMoney
    );

    if (numSpendingLimit > newTotalMoney) {
      toast.error("Spending limit cannot exceed total money!");
      return;
    }

    setAccounts((prev) => ({
      bank: prev.bank + (parseFloat(newAccount.bank) || 0),
      mobileMoney: prev.mobileMoney + (parseFloat(newAccount.mobileMoney) || 0),
      cash: prev.cash + (parseFloat(newAccount.cash) || 0),
    }));

    setSpendingLimit(numSpendingLimit);

    const dataToSend = {
      accounts: {
        bank: accounts.bank + (parseFloat(newAccount.bank) || 0),
        mobileMoney: accounts.mobileMoney + (parseFloat(newAccount.mobileMoney) || 0),
        cash: accounts.cash + (parseFloat(newAccount.cash) || 0),
      },
      spendingLimit: numSpendingLimit,
      totalMoney: newTotalMoney,
    };

    try {
      const response = await fetch("https://track-finance-backend-production.up.railway.app/api/badget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const responseData = await response.json();
      toast.success("Data submitted successfully!");
      console.log(responseData);
    } catch (error) {
      toast.error("Failed to submit data: " + error.message);
    }
    setShowModal(false);
  };

  // Get Account Icon
  const getAccountIcon = (accountType) => {
    switch (accountType) {
      case "bank":
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case "mobileMoney":
        return <Wallet className="w-5 h-5 text-green-600" />;
      case "cash":
        return <Coins className="w-5 h-5 text-yellow-600" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  // Input Field Component
  const InputField = ({ icon: Icon, label, value, onChange, type = "number" }) => (
    <div className="mb-3">
      <div className="flex items-center">
        <Icon className="w-4 h-4 text-blue-600 mr-2" />
        <label className="text-sm font-medium text-gray-700">{label}</label>
      </div>
      <div className="relative mt-1">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
        <input
          className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200 text-sm bg-gray-50
                     hover:bg-white hover:border-blue-300"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
        />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-4 bg-gray-100 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center justify-center">
              <PiggyBank className="w-8 h-8 mr-2 text-blue-600" />
              Budget Tracker
            </h1>

            <div className="flex justify-center mb-6">
              <button
                onClick={toggleModal}
                className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Setting Budget
              </button>
            </div>

            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
                <div className="relative bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
                  <button
                    onClick={toggleModal}
                    className="absolute right-3 top-3 p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>

                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center">
                      <PiggyBank className="w-6 h-6 text-blue-600 mr-2" />
                      <h3 className="text-lg font-bold text-gray-800">Budget Setup</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <InputField
                        icon={CreditCard}
                        label="Bank Balance"
                        value={newAccount.bank}
                        onChange={(value) => handleNewAccountChange("bank", value)}
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <InputField
                        icon={Wallet}
                        label="Mobile Money"
                        value={newAccount.mobileMoney}
                        onChange={(value) => handleNewAccountChange("mobileMoney", value)}
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <InputField
                        icon={Coins}
                        label="Cash"
                        value={newAccount.cash}
                        onChange={(value) => handleNewAccountChange("cash", value)}
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <InputField
                        icon={DollarSign}
                        label="Monthly Limit"
                        value={newSpendingLimit}
                        onChange={handleNewSpendingLimitChange}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddAccounts}
                    className="w-full mt-4 flex items-center justify-center px-4 py-2 
                             bg-blue-600 text-white font-medium rounded-lg
                             hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Details
                  </button>

                  <p className="text-xs text-gray-500 text-center mt-2">
                    Amounts will be added to existing balances
                  </p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <h3 className="text-lg font-semibold text-blue-800">Total Money Available</h3>
              <p className="text-3xl font-bold text-blue-600">${totalMoney.toFixed(2)}</p>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.keys(accounts).map((accountType) => (
                <div key={accountType} className="bg-white p-6 rounded-lg shadow-md text-center">
                  {getAccountIcon(accountType)}
                  <h3 className="text-lg font-semibold text-gray-800 capitalize">{accountType}</h3>
                  <p className="text-2xl font-bold text-gray-600">${accounts[accountType].toFixed(2)}</p>
                </div>
              ))}
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <DollarSign className="w-5 h-5 text-red-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-800">Spending Limit</h3>
                <p className="text-2xl font-bold text-red-600">${spendingLimit.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default BudgetTracker;