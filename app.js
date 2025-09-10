// Global state
const USER_NAME = 'You';
let userWalletBalance = 1000; // Starting with a balance for testing
let userPassword = null;
let userBankAccount = null;
let transactionHistory = [];
let countdownInterval = null;
let isDarkMode = false;
let rechargeAmount = 0;
let selectedBank = null;
let referralLists = {
    A: [
        { name: "John Smith", date: "2023-10-15" },
        { name: "Emily Johnson", date: "2023-10-18" },
        { name: "Michael Brown", date: "2023-10-22" }
    ],
    B: [
        { name: "Sarah Williams", date: "2023-10-25" },
        { name: "David Miller", date: "2023-10-28" }
    ],
    C: [
        { name: "Jennifer Davis", date: "2023-11-02" }
    ]
};

// Data persistence functions
function saveData() {
    localStorage.setItem('userWalletBalance', userWalletBalance);
    localStorage.setItem('userPassword', userPassword);
    localStorage.setItem('userBankAccount', JSON.stringify(userBankAccount));
    localStorage.setItem('transactionHistory', JSON.stringify(transactionHistory));
    localStorage.setItem('referralLists', JSON.stringify(referralLists));
    localStorage.setItem('isDarkMode', isDarkMode);
}

function loadData() {
    userWalletBalance = parseFloat(localStorage.getItem('userWalletBalance')) || 1000;
    userPassword = localStorage.getItem('userPassword') || null;
    userBankAccount = JSON.parse(localStorage.getItem('userBankAccount')) || null;
    transactionHistory = JSON.parse(localStorage.getItem('transactionHistory')) || [];
    isDarkMode = JSON.parse(localStorage.getItem('isDarkMode')) || false;
    referralLists = JSON.parse(localStorage.getItem('referralLists')) || {
        A: [
            { name: "John Smith", date: "2023-10-15" },
            { name: "Emily Johnson", date: "2023-10-18" },
            { name: "Michael Brown", date: "2023-10-22" }
        ],
        B: [
            { name: "Sarah Williams", date: "2023-10-25" },
            { name: "David Miller", date: "2023-10-28" }
        ],
        C: [
            { name: "Jennifer Davis", date: "2023-11-02" }
        ]
    };
}

function applyTheme() {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    applyTheme();
    saveData();
}

// Pool configuration (unchanged)
const pools = [
    {
        name: 'The Starter Pool',
        value: 500,
        memberLimit: 5,
        contributionPerMember: 100,
        members: [],
        contributions: {},
        winner: null,
        lastWinnerCycle: null,
        messages: [],
        startTime: null
    },
    {
        name: 'The Mid-Tier Pool',
        value: 1000,
        memberLimit: 10,
        contributionPerMember: 100,
        members: [],
        contributions: {},
        winner: null,
        lastWinnerCycle: null,
        messages: [],
        startTime: null
    },
    {
        name: 'The High-Roller Pool',
        value: 2000,
        memberLimit: 20,
        contributionPerMember: 100,
        members: [],
        contributions: {},
        winner: null,
        lastWinnerCycle: null,
        messages: [],
        startTime: null
    }
];

// Bank data for recharge
const banks = [
    { id: 1, name: "Chase Bank", logo: "chase", color: "#117ACA" },
    { id: 2, name: "Bank of America", logo: "bankofamerica", color: "#012169" },
    { id: 3, name: "Wells Fargo", logo: "wellsfargo", color: "#AD0000" },
    { id: 4, name: "Citibank", logo: "citibank", color: "#003B7F" },
    { id: 5, name: "Capital One", logo: "capitalone", color: "#004977" }
];

// Page templates - COMPLETE
const pages = {
    home: `<div class="page-card">
        <div class="home-hero">
            <h1>Welcome to The Pool</h1>
            <p>Join pools, contribute, and win big prizes with your friends!</p>
        </div>
        <div class="home-sections">
            <button class="home-section-btn" onclick="showPage('pool')">
                <i class="fas fa-water"></i>
                <h3>Join a Pool</h3>
            </button>
            <button class="home-section-btn" onclick="showPage('wallet')">
                <i class="fas fa-wallet"></i>
                <h3>My Wallet</h3>
            </button>
            <button class="home-section-btn" onclick="showPage('profile')">
                <i class="fas fa-user"></i>
                <h3>My Profile</h3>
            </button>
            <button class="home-section-btn" onclick="showPage('analytics')">
                <i class="fas fa-chart-line"></i>
                <h3>Analytics</h3>
            </button>
        </div>
    </div>`,
    
    wallet: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('home')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">My Wallet</span>
        </div>
        <div class="page-content">
            <div class="wallet-balance-card">
                <div class="balance-label">Available Balance</div>
                <div id="wallet-balance" class="balance-value">$0.00</div>
                <div class="wallet-actions">
                    <button class="wallet-action-btn" onclick="showPage('recharge')">
                        <i class="fas fa-plus"></i> Add Funds
                    </button>
                    <button class="wallet-action-btn" onclick="showPage('withdraw')">
                        <i class="fas fa-dollar-sign"></i> Withdraw
                    </button>
                </div>
            </div>
        </div>
    </div>`,
    
    analytics: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('home')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Analytics</span>
        </div>
        <div class="page-content">
            <div class="analytics-chart-container">
                <div class="analytics-chart-title">Pool Statistics</div>
                <div class="analytics-stats">
                    <div class="stat-item">
                        <h4>Total Pools</h4>
                        <p>${pools.length}</p>
                    </div>
                    <div class="stat-item">
                        <h4>Total Contributions</h4>
                        <p id="total-contributions">$0.00</p>
                    </div>
                    <div class="stat-item">
                        <h4>Total Won</h4>
                        <p id="total-won">$0.00</p>
                    </div>
                    <div class="stat-item">
                        <h4>Active Pools</h4>
                        <p id="active-pools">0</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`,
    
    settings: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('home')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Settings</span>
        </div>
        <div class="page-content">
            <div class="settings-card">
                <div class="settings-section-title">Account</div>
                <div class="settings-list">
                    <button class="settings-item" onclick="handlePasswordSetting()">
                        <i class="fas fa-lock"></i>
                        <span>${userPassword ? 'Reset Password' : 'Set Password'}</span>
                    </button>
                    <button class="settings-item" onclick="handleBankAccountSetting()">
                        <i class="fas fa-university"></i>
                        <span>${userBankAccount ? 'Bank Account' : 'Add Bank Account'}</span>
                    </button>
                    <button class="settings-item" onclick="showPage('peopleInvited')">
                        <i class="fas fa-users"></i>
                        <span>People You Invited</span>
                    </button>
                    <button class="settings-item" onclick="showPage('customerService')">
                        <i class="fas fa-headset"></i>
                        <span>Support</span>
                    </button>
                </div>
            </div>
            
            <div class="settings-card">
                <div class="settings-section-title">Preferences</div>
                <div class="settings-list">
                    <div class="settings-item">
                        <i class="fas fa-moon"></i>
                        <span>Dark Mode</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="theme-toggle">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="settings-card">
                <div class="settings-section-title">Information</div>
                <div class="settings-list">
                    <button class="settings-item" onclick="showPage('fees')">
                        <i class="fas fa-percentage"></i>
                        <span>Fee Structure</span>
                    </button>
                    <button class="settings-item" onclick="showPage('info')">
                        <i class="fas fa-info-circle"></i>
                        <span>App Info</span>
                    </button>
                    <button class="settings-item" onclick="showReferModal()">
                        <i class="fas fa-share-alt"></i>
                        <span>Invite Friends</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`,
    
    pool: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('home')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Available Pools</span>
        </div>
        <div class="page-content">
            <div id="pool-list" class="pool-list"></div>
        </div>
    </div>`,
    
    myOrder: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('home')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">My Orders</span>
        </div>
        <div class="page-content">
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <p>No orders yet</p>
            </div>
        </div>
    </div>`,
    
    transaction: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('home')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Transaction History</span>
        </div>
        <div class="page-content">
            <ul class="transaction-list" id="transaction-list"></ul>
        </div>
    </div>`,
    
    bankAccount: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('settings')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Bank Accounts</span>
        </div>
        <div class="page-content">
            ${userBankAccount ? `
                <div class="bank-account-display">
                    <div class="bank-account-header">
                        <div class="bank-account-title">Your Bank Account</div>
                        <button class="btn btn-sm btn-secondary" onclick="showResetModal('bank')">Change</button>
                    </div>
                    <div class="bank-account-details">
                        <div class="detail-item">
                            <div class="detail-label">Bank Name</div>
                            <div class="detail-value">${userBankAccount.bankName}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Account Holder</div>
                            <div class="detail-value">${userBankAccount.accountHolder}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Account Number</div>
                            <div class="detail-value">${userBankAccount.accountNumber}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Account Type</div>
                            <div class="detail-value">${userBankAccount.accountType}</div>
                        </div>
                    </div>
                </div>
            ` : `
                <div class="empty-state">
                    <i class="fas fa-university"></i>
                    <p>No bank accounts linked yet</p>
                    <button class="auth-btn" onclick="showPage('linkAccount')" style="margin-top: 20px;">Add Bank Account</button>
                </div>
            `}
        </div>
    </div>`,
    
    linkAccount: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('bankAccount')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Add Bank Account</span>
        </div>
        <div class="page-content">
            <div class="auth-header">
                <div class="auth-header-title">Connect Your Bank</div>
                <div class="auth-header-subtitle">Securely link your bank account to enable deposits and withdrawals</div>
            </div>
            
            <form class="auth-form" onsubmit="linkBankAccount(event)">
                <div class="auth-input-group">
                    <input type="text" placeholder="Bank Name" required>
                </div>
                
                <div class="auth-input-group">
                    <input type="text" placeholder="Account Holder Name" required>
                </div>
                
                <div class="auth-input-group">
                    <input type="text" placeholder="Account Number" required>
                </div>
                
                <div class="auth-input-group">
                    <select required>
                        <option value="">Select Account Type</option>
                        <option value="checking">Checking Account</option>
                        <option value="savings">Savings Account</option>
                    </select>
                </div>
                
                <button type="submit" class="auth-btn">Add Bank Account</button>
            </form>
        </div>
    </div>`,
    
    setPassword: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('settings')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">${userPassword ? 'Reset Password' : 'Set Password'}</span>
        </div>
        <div class="page-content">
            ${userPassword ? `
                <div class="password-status">
                    <i class="fas fa-check-circle"></i>
                    <div class="password-status-text">You have already set your withdrawal password</div>
                </div>
            ` : ''}
            
            <div class="auth-header">
                <div class="auth-header-title">${userPassword ? 'Reset' : 'Create'} Secure Password</div>
                <div class="auth-header-subtitle">Protect your account with a strong password</div>
            </div>
            
            <form class="auth-form" onsubmit="setPassword(event)">
                <div class="auth-input-group">
                    <input type="password" placeholder="New Password" required minlength="6">
                </div>
                
                <div class="auth-input-group">
                    <input type="password" placeholder="Confirm Password" required minlength="6">
                </div>
                
                <button type="submit" class="auth-btn">${userPassword ? 'Reset Password' : 'Set Password'}</button>
            </form>
        </div>
    </div>`,
    
    passwordSetConfirmation: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('settings')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Password ${userPassword ? 'Reset' : 'Set'}</span>
        </div>
        <div class="page-content">
            <div class="empty-state">
                <i class="fas fa-check-circle" style="color: #38a169;"></i>
                <p>Your password has been ${userPassword ? 'reset' : 'set'} successfully</p>
                <button class="auth-btn" onclick="showPage('settings')" style="margin-top: 20px;">Back to Settings</button>
            </div>
        </div>
    </div>`,
    
    peopleInvited: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('settings')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">People You Invited</span>
        </div>
        <div class="page-content">
            <div class="people-list">
                <div class="people-tier">
                    <div class="tier-header">
                        <div class="tier-title">A List (Direct Referrals)</div>
                        <div class="tier-count">${referralLists.A.length} people</div>
                    </div>
                    <div class="tier-content">
                        ${referralLists.A.length > 0 ? referralLists.A.map(person => `
                            <div class="people-item">
                                <div class="people-name">${person.name}</div>
                                <div class="people-date">${person.date}</div>
                            </div>
                        `).join('') : `
                            <div class="empty-tier">No direct referrals yet</div>
                        `}
                    </div>
                </div>
                
                <div class="people-tier">
                    <div class="tier-header">
                        <div class="tier-title">B List (Second Level)</div>
                        <div class="tier-count">${referralLists.B.length} people</div>
                    </div>
                    <div class="tier-content">
                        ${referralLists.B.length > 0 ? referralLists.B.map(person => `
                            <div class="people-item">
                                <div class="people-name">${person.name}</div>
                                <div class="people-date">${person.date}</div>
                            </div>
                        `).join('') : `
                            <div class="empty-tier">No second level referrals yet</div>
                        `}
                    </div>
                </div>
                
                <div class="people-tier">
                    <div class="tier-header">
                        <div class="tier-title">C List (Third Level)</div>
                        <div class="tier-count">${referralLists.C.length} people</div>
                    </div>
                    <div class="tier-content">
                        ${referralLists.C.length > 0 ? referralLists.C.map(person => `
                            <div class="people-item">
                                <div class="people-name">${person.name}</div>
                                <div class="people-date">${person.date}</div>
                            </div>
                        `).join('') : `
                            <div class="empty-tier">No third level referrals yet</div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    </div>`,
    
    recharge: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('wallet')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Add Funds</span>
        </div>
        <div class="page-content">
            <div class="auth-header">
                <div class="auth-header-title">Add Money to Wallet</div>
                <div class="auth-header-subtitle">Select amount to add to your wallet</div>
            </div>
            
            <div class="amount-options">
                <div class="amount-option" onclick="selectAmount(50)">$50</div>
                <div class="amount-option" onclick="selectAmount(100)">$100</div>
                <div class="amount-option" onclick="selectAmount(200)">$200</div>
                <div class="amount-option" onclick="selectAmount(500)">$500</div>
            </div>
            
            <div class="auth-input-group">
                <input type="number" id="recharge-amount" placeholder="Enter custom amount" min="10" value="100">
            </div>
            
            <button class="auth-btn" onclick="processRecharge()">Continue to Payment</button>
        </div>
    </div>`,
    
    withdraw: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('wallet')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Withdraw Funds</span>
        </div>
        <div class="page-content">
            <div class="auth-header">
                <div class="auth-header-title">Withdraw Money</div>
                <div class="auth-header-subtitle">Enter amount to withdraw from your wallet</div>
            </div>
            
            <div class="auth-input-group">
                <input type="number" id="withdraw-amount" placeholder="Enter amount" min="10" value="100">
            </div>
            
            <button class="auth-btn" onclick="initiateWithdrawal()">Withdraw Funds</button>
        </div>
    </div>`,
    
    withdrawProcessing: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('wallet')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Withdrawal Processing</span>
        </div>
        <div class="page-content">
            <div class="empty-state">
                <i class="fas fa-clock" style="color: #f39c12;"></i>
                <p>Your withdrawal is being processed</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">Funds will be transferred to your bank account within 1-3 business days</p>
            </div>
        </div>
    </div>`,
    
    info: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('settings')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">App Information</span>
        </div>
        <div class="page-content">
            <div class="settings-card">
                <h3>About The Pool App</h3>
                <p>Version 1.0.0</p>
                <p>The Pool App allows you to join pools with friends and win prizes together.</p>
            </div>
        </div>
    </div>`,
    
    customerService: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('settings')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Customer Service</span>
        </div>
        <div class="page-content">
            <div class="settings-card">
                <h3>Contact Support</h3>
                <p>Email: support@poolapp.com</p>
                <p>Phone: 1-800-POOL-APP</p>
                <p>Hours: Mon-Fri 9am-5pm EST</p>
            </div>
        </div>
    </div>`,
    
    fees: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('settings')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Fee Structure</span>
        </div>
        <div class="page-content">
            <div class="settings-card">
                <h3>Our Fees</h3>
                <p>Withdrawal fee: $1.50 per transaction</p>
                <p>No fees for deposits or pool contributions</p>
            </div>
        </div>
    </div>`,
    
    admin: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('settings')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Admin Panel</span>
        </div>
        <div class="page-content">
            <div class="empty-state">
                <i class="fas fa-lock"></i>
                <p>Admin access required</p>
            </div>
        </div>
    </div>`,

    profile: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('home')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">My Profile</span>
        </div>
        <div class="page-content">
            <div class="profile-card">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="profile-info">
                        <h3>${USER_NAME}</h3>
                        <p>Pool Enthusiast</p>
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <h4><i class="fas fa-shield-alt"></i> Account Security</h4>
                <div class="profile-item ${userPassword ? 'security-active' : 'security-inactive'}">
                    <div class="security-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <div class="profile-item-content">
                        <div class="profile-item-title">Withdrawal Password</div>
                        <div class="profile-item-subtitle">
                            ${userPassword ? 'Password is set and secured' : 'Set a password for secure withdrawals'}
                        </div>
                        <div class="security-status">
                            ${userPassword ?
                                '<span class="status-secure"><i class="fas fa-check-circle"></i> Secure</span>' :
                                '<span class="status-warning"><i class="fas fa-exclamation-triangle"></i> Not Set</span>'
                            }
                        </div>
                    </div>
                    <button class="profile-action-btn ${userPassword ? 'btn-change' : 'btn-set'}" onclick="showPage('setPassword')">
                        <i class="fas ${userPassword ? 'fa-edit' : 'fa-plus'}"></i>
                        ${userPassword ? 'Change' : 'Set Password'}
                    </button>
                </div>
            </div>

            <div class="profile-section">
                <h4><i class="fas fa-credit-card"></i> Bank Account</h4>
                ${userBankAccount ? `
                    <div class="profile-item bank-active">
                        <div class="bank-icon">
                            <i class="fas fa-university"></i>
                        </div>
                        <div class="profile-item-content">
                            <div class="profile-item-title">${userBankAccount.bankName}</div>
                            <div class="profile-item-subtitle">
                                <span class="account-holder">Account Holder: ${userBankAccount.accountHolder}</span><br>
                                <span class="account-number">Account: **** **** **** ${userBankAccount.accountNumber.slice(-4)}</span><br>
                                <span class="account-type">Type: ${userBankAccount.accountType.charAt(0).toUpperCase() + userBankAccount.accountType.slice(1)}</span><br>
                                <span class="linked-date">Linked: ${new Date(userBankAccount.linkedDate || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div class="bank-status">
                                <span class="status-verified"><i class="fas fa-shield-alt"></i> Secure & Verified</span>
                            </div>
                        </div>
                        <button class="profile-action-btn btn-change" onclick="showResetModal('bank')">
                            <i class="fas fa-edit"></i>
                            Change
                        </button>
                    </div>
                ` : `
                    <div class="profile-item bank-inactive">
                        <div class="bank-icon">
                            <i class="fas fa-university"></i>
                        </div>
                        <div class="profile-item-content">
                            <div class="profile-item-title">No Bank Account Linked</div>
                            <div class="profile-item-subtitle">
                                Link your bank account to enable withdrawals and receive prize money
                            </div>
                            <div class="bank-status">
                                <span class="status-warning"><i class="fas fa-exclamation-triangle"></i> Required</span>
                            </div>
                        </div>
                        <button class="profile-action-btn btn-add" onclick="showPage('linkAccount')">
                            <i class="fas fa-plus"></i>
                            Add Bank Account
                        </button>
                    </div>
                `}
            </div>

            <div class="profile-section">
                <h4>Wallet Balance</h4>
                <div class="profile-balance">
                    <div class="balance-amount">$${userWalletBalance.toFixed(2)}</div>
                    <div class="balance-label">Available Balance</div>
                </div>
            </div>

            <div class="profile-section">
                <h4>Recent Transactions</h4>
                <div class="profile-transactions">
                    ${transactionHistory.length > 0 ? transactionHistory.slice(0, 5).map(transaction => `
                        <div class="transaction-item-profile">
                            <div class="transaction-icon">
                                <i class="fas ${transaction.description.includes('Recharge') ? 'fa-plus-circle' :
                                                  transaction.description.includes('Contribution') ? 'fa-minus-circle' :
                                                  transaction.description.includes('Withdrawal') ? 'fa-arrow-up' :
                                                  transaction.description.includes('Won') ? 'fa-trophy' : 'fa-exchange-alt'}"></i>
                            </div>
                            <div class="transaction-details">
                                <div class="transaction-desc">${transaction.description}</div>
                                <div class="transaction-date">${transaction.date}</div>
                            </div>
                            <div class="transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                                ${transaction.amount > 0 ? '+' : ''}$${Math.abs(transaction.amount).toFixed(2)}
                            </div>
                        </div>
                    `).join('') : '<div class="no-transactions">No transactions yet</div>'}
                </div>
                <button class="view-all-btn" onclick="showPage('transaction')">View All Transactions</button>
            </div>

            <div class="profile-section">
                <h4>Referral Program</h4>
                <div class="profile-stats">
                    <div class="stat">
                        <div class="stat-number">${referralLists.A.length}</div>
                        <div class="stat-label">Direct Referrals</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${referralLists.B.length}</div>
                        <div class="stat-label">Level 2</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">${referralLists.C.length}</div>
                        <div class="stat-label">Level 3</div>
                    </div>
                </div>
            </div>
        </div>
    </div>`,

    bankSelect: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('recharge')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Select Bank</span>
        </div>
        <div class="page-content">
            <div class="recharge-amount-display">
                <div class="amount-display">
                    <span class="amount-label">Recharge Amount:</span>
                    <span class="amount-value">$${rechargeAmount.toFixed(2)}</span>
                </div>
            </div>

            <div class="bank-selection">
                <h4>Choose Payment Method</h4>
                <div class="bank-options">
                    <div class="bank-option" onclick="selectBank('alex')">
                        <div class="bank-logo">
                            <i class="fas fa-university"></i>
                        </div>
                        <div class="bank-info">
                            <div class="bank-name">Alex Bank</div>
                            <div class="bank-description">Fast & Secure Transfer</div>
                        </div>
                        <div class="bank-arrow">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                    <div class="bank-option" onclick="selectBank('john')">
                        <div class="bank-logo">
                            <i class="fas fa-university"></i>
                        </div>
                        <div class="bank-info">
                            <div class="bank-name">John Bank</div>
                            <div class="bank-description">Reliable Payment Gateway</div>
                        </div>
                        <div class="bank-arrow">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                    <div class="bank-option" onclick="selectBank('maria')">
                        <div class="bank-logo">
                            <i class="fas fa-university"></i>
                        </div>
                        <div class="bank-info">
                            <div class="bank-name">Maria Bank</div>
                            <div class="bank-description">Premium Banking Service</div>
                        </div>
                        <div class="bank-arrow">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                    <div class="bank-option" onclick="selectBank('sarah')">
                        <div class="bank-logo">
                            <i class="fas fa-university"></i>
                        </div>
                        <div class="bank-info">
                            <div class="bank-name">Sarah Bank</div>
                            <div class="bank-description">Global Transfer Network</div>
                        </div>
                        <div class="bank-arrow">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`,

    paymentDetails: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('bankSelect')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Payment Details</span>
        </div>
        <div class="page-content">
            <div class="payment-summary">
                <div class="summary-amount">
                    <span class="summary-label">Amount to Pay:</span>
                    <span class="summary-value">$${rechargeAmount.toFixed(2)}</span>
                </div>
            </div>

            <div class="payment-instructions">
                <h4>Transfer Details</h4>
                <div class="transfer-info">
                    <div class="info-item">
                        <div class="info-label">Bank Name</div>
                        <div class="info-value">${selectedBank === 'alex' ? 'Alex Bank' : selectedBank === 'john' ? 'John Bank' : selectedBank === 'maria' ? 'Maria Bank' : 'Sarah Bank'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Account Holder</div>
                        <div class="info-value">Aman Abraham Teme</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Account Number</div>
                        <div class="info-value">28738927332</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Amount</div>
                        <div class="info-value">$${rechargeAmount.toFixed(2)}</div>
                    </div>
                </div>

                <div class="payment-notice">
                    <i class="fas fa-info-circle"></i>
                    <p>Please transfer the exact amount to the account details above. Include your username "${USER_NAME}" in the transfer description.</p>
                </div>

                <button class="payment-btn" onclick="showPage('transactionId')">I Have Paid</button>
            </div>
        </div>
    </div>`,

    transactionId: `<div class="page-card">
        <div class="page-header">
            <button class="back-btn" onclick="showPage('paymentDetails')"><i class="fas fa-arrow-left"></i></button>
            <span class="page-header-title">Submit Transaction</span>
        </div>
        <div class="page-content">
            <div class="transaction-summary">
                <div class="summary-amount">
                    <span class="summary-label">Recharge Amount:</span>
                    <span class="summary-value">$${rechargeAmount.toFixed(2)}</span>
                </div>
                <div class="summary-bank">
                    <span class="summary-label">Bank:</span>
                    <span class="summary-value">${selectedBank === 'alex' ? 'Alex Bank' : selectedBank === 'john' ? 'John Bank' : selectedBank === 'maria' ? 'Maria Bank' : 'Sarah Bank'}</span>
                </div>
            </div>

            <div class="transaction-form">
                <h4>Enter Transaction Details</h4>
                <div class="form-group">
                    <label for="txn-id">Txn ID / Reference Number</label>
                    <input type="text" id="txn-id" placeholder="FT96WDY847...." required>
                    <small class="form-help">Enter the transaction ID from your bank statement (e.g., FT96WDY847....)</small>
                </div>

                <button class="submit-btn" onclick="submitTxnId()">Submit Transaction ID</button>
            </div>
        </div>
    </div>`
};

// Helper functions
function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2);
}

function updateWalletBalanceUI() {
    const balanceEl = document.getElementById('wallet-balance');
    if (balanceEl) {
        balanceEl.textContent = formatCurrency(userWalletBalance);
    }
}

function updateAnalyticsUI() {
    // Calculate total contributions
    const totalContributions = pools.reduce((total, pool) => {
        return total + (pool.members.length * pool.contributionPerMember);
    }, 0);
    
    // Calculate total won
    const totalWon = transactionHistory
        .filter(t => t.description.includes('won') || t.description.includes('Winner'))
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate active pools
    const activePools = pools.filter(pool => pool.members.length > 0 && pool.members.length < pool.memberLimit).length;
    
    // Update UI elements if they exist
    const contributionsEl = document.getElementById('total-contributions');
    const wonEl = document.getElementById('total-won');
    const activeEl = document.getElementById('active-pools');
    
    if (contributionsEl) contributionsEl.textContent = formatCurrency(totalContributions);
    if (wonEl) wonEl.textContent = formatCurrency(totalWon);
    if (activeEl) activeEl.textContent = activePools;
}

// Toast Notification System with Icons + Background Colors
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Copy invite link function
function copyReferLink() {
    const link = 'https://poolapp.com/invite/' + USER_NAME.toLowerCase().replace(/\s+/g, '-');
    
    // Create a temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = link;
    document.body.appendChild(tempInput);
    
    // Select and copy the text
    tempInput.select();
    document.execCommand('copy');
    
    // Remove the temporary input
    document.body.removeChild(tempInput);
    
    showToast('Invite link copied to clipboard!', 'success');
}

function showReferModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="modal-title">Invite Friends</div>
                <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p>Share this link with your friends to invite them to The Pool:</p>
                
                <div class="refer-link-container">
                    <input type="text" class="refer-link" value="https://poolapp.com/invite/${USER_NAME.toLowerCase().replace(/\s+/g, '-')}" readonly>
                    <button class="copy-btn" onclick="copyReferLink()">Copy</button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="this.closest('.modal-backdrop').remove()">Done</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function showResetModal(type) {
    if (type === 'bank') {
        const modal = document.createElement('div');
        modal.className = 'modal-backdrop';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">Remove Bank Account</div>
                    <button class="modal-close" onclick="this.closest('.modal-backdrop').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to remove your linked bank account? This action cannot be undone.</p>
                    <div class="warning-notice">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>You will need to re-link your bank account for future withdrawals</span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Cancel</button>
                    <button class="btn btn-danger" onclick="confirmRemoveBank()">Remove Account</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

function confirmRemoveBank() {
    userBankAccount = null;
    saveData();
    document.querySelector('.modal-backdrop').remove();
    showToast('Bank account removed successfully', 'info');
    showPage('profile');
}

// Transaction functions
function addTransaction(description, amount, status) {
    const transaction = {
        id: Date.now(),
        description,
        amount,
        status,
        date: new Date().toLocaleDateString()
    };

    transactionHistory.unshift(transaction);

    // Update wallet balance if transaction is confirmed
    if (status === 'Confirmed') {
        userWalletBalance += amount;
        updateWalletBalanceUI();
    }

    saveData();
    return transaction;
}

function renderTransactionHistory() {
    const transactionList = document.getElementById('transaction-list');
    if (!transactionList) return;
    
    if (transactionHistory.length === 0) {
        transactionList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No transactions yet</p>
            </div>
        `;
        return;
    }
    
    transactionList.innerHTML = transactionHistory.map(transaction => `
        <li class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-date">${transaction.date}</div>
            </div>
            <div class="transaction-amount ${transaction.status === 'Pending' ? 'status-pending' : 'status-confirmed'}">
                ${formatCurrency(transaction.amount)}
            </div>
        </li>
    `).join('');
}

// Pool functions
function contributeToPool(poolIndex) {
    const pool = pools[poolIndex];
    
    // Check if user is already a member
    if (!pool.members.includes(USER_NAME)) {
        // Add user as member
        pool.members.push(USER_NAME);
        pool.contributions[USER_NAME] = 0;
    }
    
    // Check if user has already contributed
    if (pool.contributions[USER_NAME] >= pool.contributionPerMember) {
        showToast('You have already contributed to this pool', 'info');
        return;
    }
    
    // Check if user has enough balance
    if (userWalletBalance < pool.contributionPerMember) {
        showToast('Insufficient balance to contribute', 'error');
        return;
    }
    
    // Process contribution
    pool.contributions[USER_NAME] = pool.contributionPerMember;
    userWalletBalance -= pool.contributionPerMember;
    
    // Add transaction
    addTransaction(`Contribution to ${pool.name}`, -pool.contributionPerMember, 'Confirmed');
    
    // Update UI
    updateWalletBalanceUI();
    updatePoolProgressUI(poolIndex);

    showToast(`Successfully contributed to ${pool.name}`, 'success');

    // If pool is now full, start countdown
    if (pool.members.length === pool.memberLimit && !pool.startTime) {
        startPoolCountdown(poolIndex);
        triggerPoolFullAnimation(poolIndex);
    }
}

function selectPoolWinner(poolIndex) {
    const pool = pools[poolIndex];
    
    if (pool.members.length === 0) {
        showToast('No members in this pool to select a winner from', 'error');
        return;
    }
    
    // Randomly select a winner
    const randomIndex = Math.floor(Math.random() * pool.members.length);
    const winner = pool.members[randomIndex];
    pool.winner = winner;
    
    // Award pool value to winner
    if (winner === USER_NAME) {
        userWalletBalance += pool.value;
        updateWalletBalanceUI();
        addTransaction(`Won ${pool.name}`, pool.value, 'Confirmed');
        showToast(`Congratulations! You won ${formatCurrency(pool.value)} from ${pool.name}`, 'success');
    }
    
    // Reset pool
    pool.members = [];
    pool.contributions = {};
    pool.startTime = null;
    pool.lastWinnerCycle = new Date().toLocaleDateString();

    // Clear countdown interval
    if (pool.interval) {
        clearInterval(pool.interval);
        pool.interval = null;
    }

    // Update UI
    updatePoolProgressUI(poolIndex);
}

function selectPoolWinnerAfterCountdown(poolIndex) {
    selectPoolWinner(poolIndex);
    showToast(`Winner selected for ${pools[poolIndex].name}`, 'info');
}

// --- Render Polished Pool List ---
function renderPoolList() {
    const poolList = document.getElementById('pool-list');
    if (!poolList) return;
    
    poolList.innerHTML = pools.map((pool, index) => {
        const progress = (pool.members.length / pool.memberLimit) * 100;
        const isMember = pool.members.includes(USER_NAME);
        const hasContributed = isMember && pool.contributions[USER_NAME] >= pool.contributionPerMember;
        
        return `
            <div class="pool-card" id="pool-${index}">
                <h3 class="pool-card-title">${pool.name}</h3>
                <div class="pool-card-info">
                    <div>Prize: ${formatCurrency(pool.value)}</div>
                    <div>Members: ${pool.memberLimit}</div>
                    <div>Contribution: ${formatCurrency(pool.contributionPerMember)} each</div>
                </div>
                
                <div class="pool-member-count">
                    <span class="member-count">${pool.members.length} of ${pool.memberLimit} members joined</span>
                    <div class="member-progress">
                        <div class="member-progress-bar" style="width: ${(pool.members.length / pool.memberLimit) * 100}%"></div>
                    </div>
                </div>
                
                <div class="pool-progress">
                    <div class="pool-progress-bar" style="width: ${progress}%; transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1);"></div>
                    <span class="progress-tooltip">${Math.round(progress)}%</span>
                    <div class="progress-tooltip-full">
                        Pool Progress: ${Math.round(progress)}%<br>
                        ${pool.members.length} of ${pool.memberLimit} members<br>
                        ${pool.members.length === pool.memberLimit ? 'Pool is full! Countdown started.' : `Need ${pool.memberLimit - pool.members.length} more members`}
                    </div>
                </div>
                
                ${pool.startTime && pool.endTime ? `
                    <div class="pool-start-info">
                        <div class="start-time">Started: ${new Date(pool.startTime).toLocaleDateString()} ${new Date(pool.startTime).toLocaleTimeString()}</div>
                    </div>
                    <div class="countdown-bar-container" data-color="${getCountdownColor(pool)}">
                        <div class="countdown-bar" style="width: ${calculateCountdownProgress(pool)}%;
                             background: linear-gradient(90deg,
                                 ${getCountdownColor(pool) === 'green' ? '#48bb78' :
                                   getCountdownColor(pool) === 'orange' ? '#ed8936' : '#e53e3e'},
                                 ${getCountdownColor(pool) === 'green' ? '#38a169' :
                                   getCountdownColor(pool) === 'orange' ? '#dd6b20' : '#c53030'});
                             background-size: 200% 100%;
                             animation: shimmer 2s infinite linear,
                                        progressFill 14s linear forwards;"></div>
                        <div class="countdown-tooltip">
                            Started: ${new Date(pool.startTime).toLocaleString()}<br>
                            Ends: ${new Date(pool.endTime).toLocaleString()}
                        </div>
                    </div>
                    <div class="countdown-text" data-color="${getCountdownColor(pool)}">
                        Winner in ${formatCountdownTime(pool)}
                    </div>
                ` : ''}
                
                ${pool.winner ? `
                    <div class="pool-winner">
                        <strong>Last Winner:</strong> ${pool.winner} (${pool.lastWinnerCycle})
                    </div>
                ` : ''}
                
                <div class="pool-actions">
                    ${!isMember ? `
                        <button class="pool-btn join" onclick="contributeToPool(${index})">
                            <i class="fas fa-plus"></i> Join Pool
                        </button>
                    ` : ''}
                    
                    ${isMember && !hasContributed ? `
                        <button class="pool-btn contribute" onclick="contributeToPool(${index})">
                            <i class="fas fa-dollar-sign"></i> Contribute
                        </button>
                    ` : ''}
                    
                    ${hasContributed ? `
                        <button class="pool-btn" disabled style="background: var(--gray);">
                            <i class="fas fa-check"></i> Contributed
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function calculateCountdownProgress(pool) {
    if (!pool.startTime || !pool.endTime) return 0;
    const elapsed = Date.now() - pool.startTime;
    const total = pool.endTime - pool.startTime;
    return Math.min(100, (elapsed / total) * 100);
}

function formatCountdownTime(pool) {
    if (!pool.startTime || !pool.endTime) return '00:00:00:00';
    const remaining = Math.max(0, pool.endTime - Date.now());

    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

    return `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getCountdownColor(pool) {
    const progress = calculateCountdownProgress(pool);
    if (progress < 50) return 'green';
    if (progress < 80) return 'orange';
    return 'red';
}

// --- Update Progress UI & Trigger Sparkle ---
function updatePoolProgressUI(poolIndex) {
    const pool = pools[poolIndex];
    const progressBar = document.querySelector(`#pool-${poolIndex} .pool-progress-bar`);

    if (progressBar) {
        const progress = (pool.members.length / pool.memberLimit) * 100;
        progressBar.style.width = `${progress}%`;

        // Update member count text and progress bar
        const memberCountEl = document.querySelector(`#pool-${poolIndex} .member-count`);
        const memberProgressBar = document.querySelector(`#pool-${poolIndex} .member-progress-bar`);
        if (memberCountEl) {
            memberCountEl.textContent = `${pool.members.length} of ${pool.memberLimit} members joined`;
        }
        if (memberProgressBar) {
            memberProgressBar.style.width = `${(pool.members.length / pool.memberLimit) * 100}%`;
            memberProgressBar.style.transition = 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
        }
    }

    // Update countdown if active
    if (pool.startTime && pool.endTime) {
        const countdownBar = document.querySelector(`#pool-${poolIndex} .countdown-bar`);
        const countdownText = document.querySelector(`#pool-${poolIndex} .countdown-text`);
        const countdownContainer = document.querySelector(`#pool-${poolIndex} .countdown-bar-container`);

        if (countdownBar && countdownText && countdownContainer) {
            const progress = calculateCountdownProgress(pool);
            countdownBar.style.width = `${progress}%`;

            const color = getCountdownColor(pool);
            countdownContainer.setAttribute('data-color', color);
            countdownText.setAttribute('data-color', color);

            countdownBar.style.background = `linear-gradient(90deg,
                ${color === 'green' ? '#48bb78' : color === 'orange' ? '#ed8936' : '#e53e3e'},
                ${color === 'green' ? '#38a169' : color === 'orange' ? '#dd6b20' : '#c53030'})`;

            countdownText.textContent = `Winner in ${formatCountdownTime(pool)}`;
        }
    }

    renderPoolList();
}

// --- Sparkle Animation ---
function triggerPoolFullAnimation(poolIndex) {
    const poolCard = document.getElementById(`pool-${poolIndex}`);
    if (poolCard) {
        poolCard.classList.add('pool-full-glow');
        
        // Remove the class after animation completes
        setTimeout(() => {
            poolCard.classList.remove('pool-full-glow');
        }, 2000);
    }
}

// --- Countdown with Animated Shimmer Bar ---
function startPoolCountdown(poolIndex) {
    const pool = pools[poolIndex];

    // Only start countdown if pool is full
    if (pool.members.length !== pool.memberLimit) {
        return;
    }

    pool.startTime = Date.now();
    pool.endTime = pool.startTime + (14 * 24 * 60 * 60 * 1000); // 14 days in milliseconds

    // Update UI to show countdown
    updatePoolProgressUI(poolIndex);

    // Set timeout to select winner after 14 days
    setTimeout(() => {
        selectPoolWinnerAfterCountdown(poolIndex);
    }, 14 * 24 * 60 * 60 * 1000); // 14 days

    // Update countdown every 10 seconds for smooth display
    if (pool.interval) {
        clearInterval(pool.interval);
    }

    pool.interval = setInterval(() => {
        updatePoolProgressUI(poolIndex);
    }, 10000); // Update every 10 seconds
}

// --- Password & Bank Account Functions ---
function handlePasswordSetting() {
    showPage('setPassword');
}

function setPassword(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters long', 'error');
        return;
    }

    userPassword = password;
    saveData();
    showToast('Password saved securely', 'success');
    showPage('passwordSetConfirmation');
}

function handleBankAccountSetting() {
    showPage('bankAccount');
}

function linkBankAccount(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    const bankName = formData.get('bankName').trim();
    const accountHolder = formData.get('accountHolder').trim();
    const accountNumber = formData.get('accountNumber').trim();
    const accountType = formData.get('accountType');

    // Validation
    if (!bankName || !accountHolder || !accountNumber || !accountType) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (accountNumber.length < 8) {
        showToast('Account number must be at least 8 digits', 'error');
        return;
    }

    if (!/^\d+$/.test(accountNumber)) {
        showToast('Account number must contain only numbers', 'error');
        return;
    }

    userBankAccount = {
        bankName: bankName,
        accountHolder: accountHolder,
        accountNumber: accountNumber,
        accountType: accountType,
        linkedDate: new Date().toISOString()
    };

    saveData();
    showToast('Bank account linked and saved securely', 'success');
    showPage('bankAccount');
}

// --- Recharge Functions ---
function selectAmount(amount) {
    document.getElementById('recharge-amount').value = amount;
}

function initiateWithdrawal() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    
    if (!amount || amount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    
    if (amount > userWalletBalance) {
        showToast('Insufficient balance', 'error');
        return;
    }
    
    if (!userBankAccount) {
        showToast('Please link a bank account first', 'error');
        showPage('linkAccount');
        return;
    }
    
    if (!userPassword) {
        showToast('Please set a withdrawal password first', 'error');
        showPage('setPassword');
        return;
    }
    
    // Process withdrawal
    userWalletBalance -= amount;
    updateWalletBalanceUI();
    addTransaction(`Withdrawal to ${userBankAccount.bankName}`, -amount, 'Pending');
    saveData();

    showPage('withdrawProcessing');
    showToast('Withdrawal request submitted', 'success');
}

function processRecharge() {
    rechargeAmount = parseFloat(document.getElementById('recharge-amount').value);
    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
        showToast('Please enter a valid amount', 'error');
        return;
    }
    showPage('bankSelect');
}

function selectBank(bank) {
    selectedBank = bank;
    showPage('paymentDetails');
}

function submitTxnId() {
    const txnId = document.getElementById('txn-id').value.trim();
    if (!txnId) {
        showToast('Please enter a valid Transaction ID', 'error');
        return;
    }

    // Simulate processing
    showToast('Transaction submitted for verification', 'info');

    // In a real app, this would send to server for verification
    // For demo, we'll auto-approve after a delay
    setTimeout(() => {
        userWalletBalance += rechargeAmount;
        updateWalletBalanceUI();
        addTransaction(`Recharge via ${selectedBank === 'alex' ? 'Alex Bank' : selectedBank === 'john' ? 'John Bank' : selectedBank === 'maria' ? 'Maria Bank' : 'Sarah Bank'}`, rechargeAmount, 'Confirmed');
        saveData();
        showToast(`Recharge of $${rechargeAmount.toFixed(2)} completed successfully!`, 'success');
        showPage('wallet');
    }, 2000);
}

// --- Page Navigation ---
function showPage(pageId) {
    const appContent = document.getElementById('app-content');

    if (pages[pageId]) {
        appContent.innerHTML = pages[pageId];

        // Update navigation active state
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-btn[data-page="${pageId}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Update specific page content if needed
        if (pageId === 'wallet') {
            updateWalletBalanceUI();
        } else if (pageId === 'transaction') {
            renderTransactionHistory();
        } else if (pageId === 'analytics') {
            updateAnalyticsUI();
        } else if (pageId === 'pool') {
            renderPoolList();
        } else if (pageId === 'settings') {
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.checked = isDarkMode;
                themeToggle.addEventListener('change', toggleTheme);
            }
        }
    } else {
        appContent.innerHTML = `<div class="page-card"><h2>Page not found</h2></div>`;
    }
}

// Initialize the app
function initApp() {
    loadData();
    applyTheme();
    showPage('home');
    updateWalletBalanceUI();

    // Add navigation event listeners
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showPage(btn.dataset.page);
        });
    });

    // Add theme toggle listener
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = isDarkMode;
        themeToggle.addEventListener('change', toggleTheme);
    }

    // Add some initial transactions for demo if none exist
    if (transactionHistory.length === 0) {
        addTransaction('Initial deposit', 1000, 'Confirmed');
        addTransaction('Pool contribution', -100, 'Confirmed');
    }
}

// Start the app when the page loads
window.onload = initApp;