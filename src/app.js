import {
  storeToken,
  getToken,
  clearToken,
  authenticateUser,
  isAuthenticated
} from './auth.js';

import {
  getUserInfo,
  getXpTransactions,
  getAuditRatio,
  getProjectGrades
} from './api.js';

// import { 
//   generateXpChart, 
//   generateAuditChart, 
//   generateGradesChart 
// } from './charts.js';

// DOM Elements
const loginSection = document.getElementById('login-section');
const profileSection = document.getElementById('profile-section');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');

// Initialize the application
async function initApp() {
  if (isAuthenticated()) {
    // User is logged in, show profile
    loginSection.style.display = 'none';
    profileSection.style.display = 'block';
    await loadProfileData();
  } else {
    // User is not logged in, show login form
    loginSection.style.display = 'block';
    profileSection.style.display = 'none';
  }
}

// Load and display profile data
async function loadProfileData() {
  try {
    profileSection.innerHTML = '<p>Loading profile data...</p>';

    const [userInfo, xpData, auditData, gradesData] = await Promise.all([
      getUserInfo().catch(err => { throw new Error(`User info: ${err.message}`); }),
      getXpTransactions().catch(err => { throw new Error(`XP data: ${err.message}`); }),
      getAuditRatio().catch(err => { throw new Error(`Audit data: ${err.message}`); }),
      getProjectGrades().catch(err => { throw new Error(`Grades data: ${err.message}`); })
    ]);

    // Update basic info
    document.getElementById('user-login').textContent = userInfo.login;
    document.getElementById('user-email').textContent = userInfo.email;
    document.getElementById('join-date').textContent = new Date(userInfo.createdAt).toLocaleDateString();

    // // Calculate and display total XP
    // const totalXp = xpData.reduce((sum, t) => sum + t.amount, 0);
    // document.getElementById('total-xp').textContent = totalXp;

    // // Display audit ratio
    // document.getElementById('audit-ratio').textContent = `${auditData.up}:${auditData.down}`;

    // // Display projects completed
    // document.getElementById('projects-completed').textContent = gradesData.length;

    // // Generate charts
    // generateXpChart(xpData);
    // generateAuditChart(auditData);
    // generateGradesChart(gradesData);

  } catch (error) {
    console.error('Failed to load profile data:', error);
    alert(`Error: ${error.message}`); // Show specific error
    logout();
  }
}

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const identifier = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    console.log('Login form submitted');
    console.log('Identifier:', identifier);
    console.log('Password length:', password.length);

    // Clear any previous errors
    loginError.textContent = '';

    try {
        console.log('Calling authenticateUser...');
        const token = await authenticateUser(identifier, password);
        console.log('Authentication successful, token:', token ? 'received' : 'undefined');
        
        if (!token) {
            throw new Error('Authentication returned undefined token');
        }
        
        storeToken(token);
        await initApp();
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = error.message;
    }
});

// Handle logout
logoutBtn.addEventListener('click', () => {
  clearToken();
  initApp();
});

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', initApp);