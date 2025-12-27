import React, { useState, useEffect } from 'react';
import { accountingAPI } from '../services/api';
import './Accounting.css';

const Accounting = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [activeTab, setActiveTab] = useState('accounts');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [accountsRes, transactionsRes, balanceRes, profitRes] = await Promise.all([
        accountingAPI.getAccounts(),
        accountingAPI.getTransactions(),
        accountingAPI.getBalanceSheet(),
        accountingAPI.getProfitLoss()
      ]);
      setAccounts(accountsRes.data);
      setTransactions(transactionsRes.data);
      setBalanceSheet(balanceRes.data);
      setProfitLoss(profitRes.data);
    } catch (error) {
      console.error('Error loading accounting data:', error);
    }
  };

  return (
    <div className="accounting-page">
      <div className="page-header">
        <h1 className="page-title">Accounting</h1>
        <p className="page-subtitle">Financial management and reporting</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          Chart of Accounts
        </button>
        <button
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button
          className={`tab ${activeTab === 'balance' ? 'active' : ''}`}
          onClick={() => setActiveTab('balance')}
        >
          Balance Sheet
        </button>
        <button
          className={`tab ${activeTab === 'profit' ? 'active' : ''}`}
          onClick={() => setActiveTab('profit')}
        >
          Profit & Loss
        </button>
      </div>

      {activeTab === 'accounts' && (
        <div className="card">
          <div className="card-header">Chart of Accounts</div>
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Account Name</th>
                <th>Type</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(account => (
                <tr key={account.id}>
                  <td>{account.code}</td>
                  <td>{account.name}</td>
                  <td>
                    <span className={`badge badge-${account.type === 'asset' ? 'success' : account.type === 'liability' ? 'danger' : 'info'}`}>
                      {account.type}
                    </span>
                  </td>
                  <td>Rp {account.balance.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="card">
          <div className="card-header">Transactions</div>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Account</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 50).map(transaction => (
                <tr key={transaction.id}>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>{transaction.accountCode}</td>
                  <td>
                    <span className={`badge ${transaction.type === 'debit' ? 'badge-success' : 'badge-danger'}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td>Rp {transaction.amount.toLocaleString('id-ID')}</td>
                  <td>{transaction.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'balance' && balanceSheet && (
        <div className="card">
          <div className="card-header">Balance Sheet</div>
          <div className="financial-statement">
            <div className="statement-section">
              <h3>Assets</h3>
              {balanceSheet.assets.items.map(asset => (
                <div key={asset.id} className="statement-item">
                  <span>{asset.name}</span>
                  <span>Rp {asset.balance.toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="statement-total">
                <span>Total Assets</span>
                <span>Rp {balanceSheet.assets.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="statement-section">
              <h3>Liabilities</h3>
              {balanceSheet.liabilities.items.map(liability => (
                <div key={liability.id} className="statement-item">
                  <span>{liability.name}</span>
                  <span>Rp {liability.balance.toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="statement-total">
                <span>Total Liabilities</span>
                <span>Rp {balanceSheet.liabilities.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="statement-section">
              <h3>Equity</h3>
              {balanceSheet.equity.items.map(equity => (
                <div key={equity.id} className="statement-item">
                  <span>{equity.name}</span>
                  <span>Rp {equity.balance.toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="statement-total">
                <span>Total Equity</span>
                <span>Rp {balanceSheet.equity.total.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profit' && profitLoss && (
        <div className="card">
          <div className="card-header">Profit & Loss Statement</div>
          <div className="financial-statement">
            <div className="statement-section">
              <h3>Revenue</h3>
              {profitLoss.revenue.items.map(revenue => (
                <div key={revenue.id} className="statement-item">
                  <span>{revenue.name}</span>
                  <span>Rp {revenue.balance.toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="statement-total">
                <span>Total Revenue</span>
                <span>Rp {profitLoss.revenue.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="statement-section">
              <h3>Expenses</h3>
              {profitLoss.expenses.items.map(expense => (
                <div key={expense.id} className="statement-item">
                  <span>{expense.name}</span>
                  <span>Rp {expense.balance.toLocaleString('id-ID')}</span>
                </div>
              ))}
              <div className="statement-total">
                <span>Total Expenses</span>
                <span>Rp {profitLoss.expenses.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="statement-section">
              <div className="statement-total net-income" style={{ color: profitLoss.netIncome >= 0 ? '#28A745' : '#DC3545' }}>
                <span>Net Income</span>
                <span>Rp {profitLoss.netIncome.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounting;

