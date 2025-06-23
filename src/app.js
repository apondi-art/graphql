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
  getProjectGrades,
  formatXP
} from './api.js';

import { 
  generateXpChart, 
  generateAuditChart, 
  generateGradesChart 
} from './charts.js';

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
    // Show loading state without destroying the DOM structure
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.textContent = 'Loading profile data...';
    profileSection.prepend(loadingIndicator);

    const [userInfo, xpData, auditData, gradesData] = await Promise.all([
      getUserInfo().catch(err => { throw new Error(`User info: ${err.message}`); }),
      getXpTransactions().catch(err => { throw new Error(`XP data: ${err.message}`); }),
      getAuditRatio().catch(err => { throw new Error(`Audit data: ${err.message}`); }),
      getProjectGrades().catch(err => { throw new Error(`Grades data: ${err.message}`); })
    ]);

    // Remove loading indicator
    loadingIndicator.remove();

    // Update basic info
    document.getElementById('user-login').textContent = userInfo.login;
    document.getElementById('user-email').textContent = userInfo.email;
    document.getElementById('join-date').textContent = new Date(userInfo.createdAt).toLocaleDateString();

    // Calculate and display total XP
    const totalXp = xpData.reduce((sum, t) => sum + t.amount, 0);
    document.getElementById('total-xp').textContent = formatXP(totalXp);

    // Display audit ratio
    document.getElementById('audit-ratio').textContent = `${auditData.ratio}`;

    // Display projects completed
    document.getElementById('projects-completed').textContent = gradesData.length;

    // Generate charts
    generateXpChart(xpData);
    generateAuditChart(auditData);
    generateGradesChart(gradesData);

  } catch (error) {
    console.error('Failed to load profile data:', error);
    alert(`Error: ${error.message}`);
    // Clear token and reset UI if there's an error
    clearToken();
    loginSection.style.display = 'block';
    profileSection.style.display = 'none';
  }
}

// Handle login form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const identifier = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  // Clear any previous errors
  loginError.textContent = '';

  try {
    const token = await authenticateUser(identifier, password);
    
    if (!token) {
      throw new Error('Authentication failed. Please check your credentials.');
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