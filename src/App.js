import React from 'react'
import Sidebar from './Components/Dashboard/Sidebar'
import './index.css';
import Dashboard from './Components/Dashboard/Dashboard';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Transaction from './Components/Dashboard/Transaction';
import Login from './pages/Login';
import TransactionList from './Components/Dashboard/TransationList';
import Badget from './Components/Dashboard/Badget';
import Home from './Components/Dashboard/Home';
import Report from './Components/Dashboard/Report';
import Footer from './Components/Dashboard/Footer';
function App() {
  return (
    // <Sidebar/>
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/report" element={<Report />} />
        <Route path="/home" element={<Home />} />
        <Route path="/budget" element={<Badget />} />
        <Route path="/list" element={<TransactionList />} />
        <Route path="/transaction" element={<Transaction />} />
        <Route path="/footer" element={<Footer />} />
        <Route path="*" element={<h1>Not found</h1>} />

      </Routes>
    </Router>
  )
}

export default App
