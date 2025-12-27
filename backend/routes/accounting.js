const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const accountsPath = path.join(__dirname, '../data/accounting/accounts.json');
const transactionsPath = path.join(__dirname, '../data/accounting/transactions.json');

// Helper functions
const readAccounts = () => {
  try {
    return JSON.parse(fs.readFileSync(accountsPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeAccounts = (data) => {
  fs.writeFileSync(accountsPath, JSON.stringify(data, null, 2));
};

const readTransactions = () => {
  try {
    return JSON.parse(fs.readFileSync(transactionsPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeTransactions = (data) => {
  fs.writeFileSync(transactionsPath, JSON.stringify(data, null, 2));
};

const updateAccountBalance = (accountCode, amount, type) => {
  const accounts = readAccounts();
  const account = accounts.find(a => a.code === accountCode);
  if (account) {
    if (type === 'debit') {
      if (account.type === 'asset' || account.type === 'expense') {
        account.balance = (account.balance || 0) + amount;
      } else {
        account.balance = (account.balance || 0) - amount;
      }
    } else {
      if (account.type === 'asset' || account.type === 'expense') {
        account.balance = (account.balance || 0) - amount;
      } else {
        account.balance = (account.balance || 0) + amount;
      }
    }
    writeAccounts(accounts);
  }
};

// Get all accounts
router.get('/accounts', (req, res) => {
  const accounts = readAccounts();
  res.json(accounts);
});

// Get account by code
router.get('/accounts/:code', (req, res) => {
  const accounts = readAccounts();
  const account = accounts.find(a => a.code === req.params.code);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  res.json(account);
});

// Create account
router.post('/accounts', (req, res) => {
  const accounts = readAccounts();
  const { code, name, type, category } = req.body;
  
  if (accounts.find(a => a.code === code)) {
    return res.status(400).json({ error: 'Account code already exists' });
  }
  
  const newAccount = {
    id: uuidv4(),
    code,
    name,
    type,
    category: category || 'general',
    balance: 0
  };
  
  accounts.push(newAccount);
  writeAccounts(accounts);
  res.status(201).json(newAccount);
});

// Get all transactions
router.get('/transactions', (req, res) => {
  const transactions = readTransactions();
  const { startDate, endDate, accountCode } = req.query;
  
  let filtered = transactions;
  
  if (startDate) {
    filtered = filtered.filter(t => new Date(t.date) >= new Date(startDate));
  }
  if (endDate) {
    filtered = filtered.filter(t => new Date(t.date) <= new Date(endDate));
  }
  if (accountCode) {
    filtered = filtered.filter(t => t.accountCode === accountCode);
  }
  
  res.json(filtered);
});

// Create transaction
router.post('/transactions', (req, res) => {
  const { date, accountCode, type, amount, description, reference, referenceType } = req.body;
  
  if (!accountCode || !type || !amount) {
    return res.status(400).json({ error: 'Account code, type, and amount are required' });
  }
  
  const accounts = readAccounts();
  if (!accounts.find(a => a.code === accountCode)) {
    return res.status(400).json({ error: 'Account not found' });
  }
  
  const transaction = {
    id: uuidv4(),
    date: date || new Date().toISOString(),
    accountCode,
    type,
    amount: parseFloat(amount),
    description: description || '',
    reference: reference || null,
    referenceType: referenceType || 'manual'
  };
  
  const transactions = readTransactions();
  transactions.push(transaction);
  writeTransactions(transactions);
  
  // Update account balance
  updateAccountBalance(accountCode, parseFloat(amount), type);
  
  res.status(201).json(transaction);
});

// Create journal entry (double entry)
router.post('/journal-entry', (req, res) => {
  const { date, entries, description } = req.body;
  
  if (!entries || entries.length < 2) {
    return res.status(400).json({ error: 'At least 2 entries required for journal entry' });
  }
  
  // Validate debits equal credits
  const totalDebits = entries
    .filter(e => e.type === 'debit')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalCredits = entries
    .filter(e => e.type === 'credit')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);
  
  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    return res.status(400).json({ error: 'Debits and credits must be equal' });
  }
  
  const journalId = uuidv4();
  const transactions = readTransactions();
  const createdTransactions = [];
  
  entries.forEach(entry => {
    const transaction = {
      id: uuidv4(),
      journalId,
      date: date || new Date().toISOString(),
      accountCode: entry.accountCode,
      type: entry.type,
      amount: parseFloat(entry.amount),
      description: entry.description || description || 'Journal Entry',
      reference: journalId,
      referenceType: 'journal'
    };
    
    transactions.push(transaction);
    createdTransactions.push(transaction);
    updateAccountBalance(entry.accountCode, parseFloat(entry.amount), entry.type);
  });
  
  writeTransactions(transactions);
  res.status(201).json({ journalId, transactions: createdTransactions });
});

// Get balance sheet
router.get('/balance-sheet', (req, res) => {
  const accounts = readAccounts();
  const { date } = req.query;
  
  const assets = accounts.filter(a => a.type === 'asset');
  const liabilities = accounts.filter(a => a.type === 'liability');
  const equity = accounts.filter(a => a.type === 'equity');
  
  const totalAssets = assets.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalEquity = equity.reduce((sum, a) => sum + (a.balance || 0), 0);
  
  res.json({
    assets: {
      items: assets,
      total: totalAssets
    },
    liabilities: {
      items: liabilities,
      total: totalLiabilities
    },
    equity: {
      items: equity,
      total: totalEquity
    },
    total: totalAssets,
    date: date || new Date().toISOString()
  });
});

// Get profit & loss statement
router.get('/profit-loss', (req, res) => {
  const accounts = readAccounts();
  const { startDate, endDate } = req.query;
  
  const revenue = accounts.filter(a => a.type === 'revenue');
  const expenses = accounts.filter(a => a.type === 'expense');
  
  const totalRevenue = revenue.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalExpenses = expenses.reduce((sum, a) => sum + (a.balance || 0), 0);
  const netIncome = totalRevenue - totalExpenses;
  
  res.json({
    revenue: {
      items: revenue,
      total: totalRevenue
    },
    expenses: {
      items: expenses,
      total: totalExpenses
    },
    netIncome,
    startDate: startDate || new Date().toISOString(),
    endDate: endDate || new Date().toISOString()
  });
});

module.exports = router;

