const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const usersPath = path.join(__dirname, '../data/users/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Helper functions
const readUsers = () => {
  try {
    return JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  } catch (error) {
    return [];
  }
};

const writeUsers = (data) => {
  fs.writeFileSync(usersPath, JSON.stringify(data, null, 2));
};

// Initialize default users if no users exist or reset admin if needed
const initDefaultUser = () => {
  try {
    // Ensure data directory exists
    const usersDir = path.dirname(usersPath);
    if (!fs.existsSync(usersDir)) {
      fs.mkdirSync(usersDir, { recursive: true });
      console.log('✓ Created users data directory');
    }
    
    // Ensure users.json exists
    if (!fs.existsSync(usersPath)) {
      fs.writeFileSync(usersPath, JSON.stringify([], null, 2));
      console.log('✓ Created users.json file');
    }
    
    const users = readUsers();
    
    // Create a consistent hash for admin123 - use a fixed salt for consistency
    // But actually, we'll verify the password works by testing it
    const testPassword = 'admin123';
    const hashedPassword = bcrypt.hashSync(testPassword, 10);
    
    // Verify the hash works before using it
    const testVerify = bcrypt.compareSync(testPassword, hashedPassword);
    if (!testVerify) {
      throw new Error('Password hash verification failed during initialization');
    }
    
    // Always ensure default users exist with correct password
    const defaultUsers = [
      {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        name: 'Administrator',
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        username: 'manager',
        email: 'manager@example.com',
        password: hashedPassword,
        role: 'manager',
        name: 'Manager',
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        username: 'cashier',
        email: 'cashier@example.com',
        password: hashedPassword,
        role: 'cashier',
        name: 'Cashier',
        createdAt: new Date().toISOString()
      }
    ];
    
    let usersUpdated = false;
    
    if (users.length === 0) {
      // No users exist, add all defaults
      defaultUsers.forEach(user => users.push(user));
      writeUsers(users);
      usersUpdated = true;
      console.log('✓ Default users created (admin, manager, cashier)');
      
      // Verify users were written correctly
      const verifyUsers = readUsers();
      console.log(`✓ Verified: ${verifyUsers.length} users in file`);
    } else {
      // Users exist, but ensure all default users exist with correct password
      defaultUsers.forEach(defaultUser => {
        const existingUserIndex = users.findIndex(u => u.username === defaultUser.username);
        if (existingUserIndex === -1) {
          // User doesn't exist, add it
          users.push(defaultUser);
          usersUpdated = true;
          console.log(`✓ ${defaultUser.username} user created`);
        } else {
          // User exists, ALWAYS update password to ensure it's correct
          const oldPassword = users[existingUserIndex].password;
          users[existingUserIndex].password = hashedPassword;
          users[existingUserIndex].email = defaultUser.email; // Also update email
          users[existingUserIndex].name = defaultUser.name; // Also update name
          usersUpdated = true;
          console.log(`✓ ${defaultUser.username} password reset to default`);
          console.log(`  Old hash: ${oldPassword ? oldPassword.substring(0, 20) + '...' : 'none'}`);
          console.log(`  New hash: ${hashedPassword.substring(0, 20)}...`);
        }
      });
      
      if (usersUpdated) {
        writeUsers(users);
        console.log('✓ Users file updated');
        
        // Verify the update worked
        const verifyUsers = readUsers();
        verifyUsers.forEach(u => {
          if (['admin', 'manager', 'cashier'].includes(u.username)) {
            const passwordTest = bcrypt.compareSync(testPassword, u.password);
            console.log(`✓ ${u.username} password verification: ${passwordTest ? 'PASS' : 'FAIL'}`);
          }
        });
      }
    }
    
    // Log current users for debugging
    console.log(`✓ Total users in system: ${users.length}`);
    users.forEach(u => {
      console.log(`  - ${u.username} (${u.role})`);
    });
    
  } catch (error) {
    console.error('✗ ERROR initializing default users:', error.message);
    console.error(error.stack);
  }
};

// Initialize on module load
// Initialize users immediately (setImmediate might cause issues in some environments)
try {
  initDefaultUser();
} catch (error) {
  console.error('Error initializing users on module load:', error);
  // Don't throw - let it initialize on first request
}

// Debug endpoint to check users
router.get('/check-users', (req, res) => {
  try {
    const users = readUsers();
    const usersPath = path.join(__dirname, '../data/users/users.json');
    const fileExists = fs.existsSync(usersPath);
    
    res.json({
      fileExists,
      filePath: usersPath,
      userCount: users.length,
      users: users.map(u => ({
        username: u.username,
        role: u.role,
        email: u.email,
        hasPassword: !!u.password,
        passwordLength: u.password ? u.password.length : 0
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check users', details: error.message });
  }
});

// Test login endpoint (for debugging)
router.post('/test-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Ensure users are initialized
    initDefaultUser();
    
    const users = readUsers();
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return res.json({
        success: false,
        error: 'User not found',
        availableUsers: users.map(u => u.username)
      });
    }
    
    // Test password comparison (using async to match login endpoint)
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    // Also test with a known hash to verify bcryptjs is working
    const testHash = bcrypt.hashSync('admin123', 10);
    const testCompare = await bcrypt.compare('admin123', testHash);
    
    return res.json({
      success: isValidPassword,
      userFound: true,
      username: user.username,
      passwordMatch: isValidPassword,
      testHashWorks: testCompare,
      userPasswordHash: user.password.substring(0, 20) + '...',
      message: isValidPassword ? 'Password is correct' : 'Password does not match'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Test login failed', 
      details: error.message,
      stack: error.stack
    });
  }
});

// Also add routes to manually initialize/reset users (both GET and POST for convenience)
router.get('/init-users', (req, res) => {
  try {
    // Force reset by deleting existing users file first
    const usersPath = path.join(__dirname, '../data/users/users.json');
    if (fs.existsSync(usersPath)) {
      fs.unlinkSync(usersPath);
      console.log('[INIT] Deleted existing users.json to force reset');
    }
    
    // Reinitialize
    initDefaultUser();
    
    // Verify users were created
    const users = readUsers();
    const testPassword = 'admin123';
    
    // Test that passwords work
    const passwordTests = users.map(u => {
      if (['admin', 'manager', 'cashier'].includes(u.username)) {
        const test = bcrypt.compareSync(testPassword, u.password);
        return { username: u.username, passwordWorks: test };
      }
      return null;
    }).filter(Boolean);
    
    res.json({ 
      message: 'Default users initialized successfully',
      userCount: users.length,
      users: users.map(u => ({ username: u.username, role: u.role, email: u.email })),
      passwordTests: passwordTests,
      loginCredentials: {
        username: 'admin',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('[INIT] Error:', error);
    res.status(500).json({ error: 'Failed to initialize users', details: error.message });
  }
});

router.post('/init-users', (req, res) => {
  try {
    // Force reset by deleting existing users file first
    const usersPath = path.join(__dirname, '../data/users/users.json');
    if (fs.existsSync(usersPath)) {
      fs.unlinkSync(usersPath);
      console.log('[INIT] Deleted existing users.json to force reset');
    }
    
    // Reinitialize
    initDefaultUser();
    
    // Verify users were created
    const users = readUsers();
    const testPassword = 'admin123';
    
    // Test that passwords work
    const passwordTests = users.map(u => {
      if (['admin', 'manager', 'cashier'].includes(u.username)) {
        const test = bcrypt.compareSync(testPassword, u.password);
        return { username: u.username, passwordWorks: test };
      }
      return null;
    }).filter(Boolean);
    
    res.json({ 
      message: 'Default users initialized successfully',
      userCount: users.length,
      users: users.map(u => ({ username: u.username, role: u.role, email: u.email })),
      passwordTests: passwordTests,
      loginCredentials: {
        username: 'admin',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('[INIT] Error:', error);
    res.status(500).json({ error: 'Failed to initialize users', details: error.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  const { username, email, password, name, role } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }
  
  const users = readUsers();
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: uuidv4(),
    username,
    email,
    password: hashedPassword,
    role: role || 'user',
    name: name || username,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  writeUsers(users);
  
  const token = jwt.sign(
    { userId: newUser.id, username: newUser.username, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    }
  });
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // ALWAYS ensure users are initialized before login attempt
    // This is critical for Railway deployments
    initDefaultUser();
    
    // Small delay to ensure file write is complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const users = readUsers();
    console.log(`[LOGIN] Attempt for username: ${username}`);
    console.log(`[LOGIN] Total users in system: ${users.length}`);
    console.log(`[LOGIN] Available usernames: ${users.map(u => u.username).join(', ')}`);
    
    if (users.length === 0) {
      console.log(`[LOGIN] No users found! Re-initializing...`);
      initDefaultUser();
      await new Promise(resolve => setTimeout(resolve, 100));
      const retryUsers = readUsers();
      console.log(`[LOGIN] After re-init, users count: ${retryUsers.length}`);
    }
    
    const user = users.find(u => u.username === username);
    
    if (!user) {
      console.log(`[LOGIN] User not found: ${username}`);
      console.log(`[LOGIN] Available users: ${users.map(u => u.username)}`);
      return res.status(401).json({ 
        error: 'Invalid credentials',
        debug: {
          userFound: false,
          availableUsers: users.map(u => u.username),
          totalUsers: users.length
        }
      });
    }
    
    console.log(`[LOGIN] User found: ${user.username}`);
    console.log(`[LOGIN] User password hash exists: ${!!user.password}`);
    console.log(`[LOGIN] User password hash length: ${user.password ? user.password.length : 0}`);
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    console.log(`[LOGIN] Password comparison result: ${isValidPassword}`);
    
    if (!isValidPassword) {
      // Try to verify with a test hash to see if bcrypt is working
      const testHash = bcrypt.hashSync('admin123', 10);
      const testCompare = await bcrypt.compare('admin123', testHash);
      console.log(`[LOGIN] Test hash comparison: ${testCompare}`);
      console.log(`[LOGIN] Password mismatch for user: ${username}`);
      
      return res.status(401).json({ 
        error: 'Invalid credentials',
        debug: {
          userFound: true,
          passwordMatch: false,
          bcryptWorking: testCompare
        }
      });
    }
    
    console.log(`[LOGIN] ✓ Login successful for user: ${username}`);
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('[LOGIN] ERROR:', error);
    console.error('[LOGIN] Stack:', error.stack);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Get current user
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = readUsers();
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;

