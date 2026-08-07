/* ==========================================================================
   AI-Based Customized Time Slot Delivery of Articles/Parcels - JAVASCRIPT
   ========================================================================== */

// --- Global Application State ---
let appState = {
    currentUser: null,
    deliveries: [],
    notifications: [],
    currentPage: 'home',
    historyPage: 1,
    historyLimit: 5,
    simulatedConditions: {
        traffic: 'Low',
        weather: 'Sunny',
        historyScore: 85,
        distance: 4.2
    }
};

// --- Initial Seed Data (Populated on First Load) ---
const INITIAL_DELIVERIES = [
    {
        id: 'TRK-582049',
        customerName: 'Alex Mercer',
        phone: '9876543210',
        address: 'Apt 4B, Sector 62, Metro City',
        parcelType: 'Electronics',
        weight: 1.8,
        priority: 'Normal',
        date: '2026-08-05',
        timePref: 'Morning',
        instructions: 'Leave at front desk',
        aiScore: 88,
        recommendedSlot: '10:00 AM - 11:00 AM',
        confidence: 90,
        eta: '10:15 AM',
        status: 'Completed',
        rating: 5,
        timestamp: Date.now() - 172800000 // 2 days ago
    },
    {
        id: 'TRK-902148',
        customerName: 'Alex Mercer',
        phone: '9876543210',
        address: 'Apt 4B, Sector 62, Metro City',
        parcelType: 'Medicine',
        weight: 0.5,
        priority: 'Emergency',
        date: '2026-08-06',
        timePref: 'Morning',
        instructions: 'Deliver immediately. Keep in shade.',
        aiScore: 97,
        recommendedSlot: '08:30 AM - 09:30 AM',
        confidence: 98,
        eta: '08:45 AM',
        status: 'Completed',
        rating: 5,
        timestamp: Date.now() - 86400000 // 1 day ago
    },
    {
        id: 'TRK-100293',
        customerName: 'Alex Mercer',
        phone: '9876543210',
        address: 'Apt 4B, Sector 62, Metro City',
        parcelType: 'Food',
        weight: 1.2,
        priority: 'High',
        date: '2026-08-07',
        timePref: 'Afternoon',
        instructions: 'Ring bell twice',
        aiScore: 92,
        recommendedSlot: '01:00 PM - 02:00 PM',
        confidence: 94,
        eta: '01:24 PM',
        status: 'Transit',
        rating: 0,
        timestamp: Date.now()
    },
    {
        id: 'TRK-392019',
        customerName: 'Jane Smith',
        phone: '8765432109',
        address: 'Villa 12, Palm Meadows, East suburb',
        parcelType: 'Document',
        weight: 0.2,
        priority: 'Normal',
        date: '2026-08-07',
        timePref: 'Evening',
        instructions: 'Signature required',
        aiScore: 78,
        recommendedSlot: '05:30 PM - 06:30 PM',
        confidence: 81,
        eta: '05:50 PM',
        status: 'Pending',
        rating: 0,
        timestamp: Date.now() + 10000
    },
    {
        id: 'TRK-220491',
        customerName: 'Marcus Aurelius',
        phone: '9001234567',
        address: 'Penthouse B, Tower A, Skyline Residency',
        parcelType: 'Others',
        weight: 12.5,
        priority: 'Normal',
        date: '2026-08-08',
        timePref: 'Afternoon',
        instructions: 'Use service lift',
        aiScore: 82,
        recommendedSlot: '02:30 PM - 03:30 PM',
        confidence: 85,
        eta: '03:10 PM',
        status: 'Pending',
        rating: 0,
        timestamp: Date.now() + 86400000
    },
    {
        id: 'TRK-603921',
        customerName: 'Serena Williams',
        phone: '7765123489',
        address: '42 Court Lane, Wimbledon Heights',
        parcelType: 'Electronics',
        weight: 4.5,
        priority: 'High',
        date: '2026-08-05',
        timePref: 'Evening',
        instructions: 'Deliver to back door',
        aiScore: 71,
        recommendedSlot: '06:00 PM - 07:00 PM',
        confidence: 76,
        eta: '06:45 PM',
        status: 'Cancelled',
        rating: 0,
        timestamp: Date.now() - 172800000
    }
];

const INITIAL_NOTIFICATIONS = [
    { text: "LogiAI Database initialized with seed profiles.", type: "system", time: "Just Now" },
    { text: "Your package (TRK-100293) is currently out for delivery.", type: "primary", time: "2 hours ago" },
    { text: "Emergency Medicine delivery (TRK-902148) successfully completed on schedule.", type: "urgent", time: "1 day ago" }
];

// ==========================================================================
// APPLICATION INITIALIZATION
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    // Load initial states from LocalStorage or seed defaults
    loadState();
    
    // Setup Page Navigation & Loaders
    setTimeout(() => {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 1200);

    // Initialize custom simulation elements
    randomizeSimulatedConditions();
    // Run counting animation on Home Page
    runCountingAnimation();
    
    // Bind Event Listeners
    setupEventListeners();
    
    // Render current active layout elements
    renderNavBar();
    updateDashboardMetrics();
    updateAdminStats();
    
    // Populate dropdown date defaults (e.g. today or later)
    const dateInput = document.getElementById('book-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
    }
});

// --- LocalStorage State Operations ---
function loadState() {
    const savedData = localStorage.getItem('logi_ai_data');
    if (savedData) {
        try {
            appState = JSON.parse(savedData);
        } catch (e) {
            console.error("Failed to parse LocalStorage data. Resetting...", e);
            resetStateToDefault();
        }
    } else {
        resetStateToDefault();
    }
}

function saveState() {
    localStorage.setItem('logi_ai_data', JSON.stringify(appState));
}

function resetStateToDefault() {
    appState.currentUser = null;
    appState.deliveries = [...INITIAL_DELIVERIES];
    appState.notifications = [...INITIAL_NOTIFICATIONS];
    appState.currentPage = 'home';
    appState.historyPage = 1;
    saveState();
}

function resetAppDatabase() {
    if (confirm("Are you sure you want to reset all LocalStorage data back to default demo logs?")) {
        resetStateToDefault();
        showToast("Database successfully reset!", "success");
        speakText("Database restored to defaults.");
        setTimeout(() => window.location.reload(), 1000);
    }
}

// ==========================================================================
// NAVIGATION & SPA ROUTING
// ==========================================================================
function navigateTo(pageId) {
    // Check access restrictions
    if (pageId !== 'home' && pageId !== 'login' && pageId !== 'settings' && !appState.currentUser) {
        showToast("Please login as customer or admin to access this screen.", "warning");
        pageId = 'login';
    }

    // Toggle active section UI
    const pages = document.querySelectorAll('.app-page');
    pages.forEach(p => p.classList.remove('active-page'));
    
    const activeSection = document.getElementById(`page-${pageId}`);
    if (activeSection) {
        activeSection.classList.add('active-page');
        appState.currentPage = pageId;
    }

    // Update Nav bar links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.id === `nav-${pageId}`) {
            link.classList.add('active');
        }
    });

    // Special page activations
    if (pageId === 'customer-dashboard') {
        renderDashboardDeliveries();
    } else if (pageId === 'delivery-history') {
        renderHistoryTable();
    } else if (pageId === 'ai-analytics') {
        // Must delay slightly to ensure canvas elements are sized in DOM before drawing
        setTimeout(renderAnalyticsCharts, 100);
    } else if (pageId === 'admin-panel') {
        renderAdminQueue();
        updateAdminStats();
    } else if (pageId === 'home') {
        runCountingAnimation();
    }

    window.scrollTo(0, 0);
}

function toggleLoginTab(tab) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const groupName = document.getElementById('group-name');
    const authBtn = document.getElementById('auth-btn');
    const title = document.getElementById('login-title');
    const subtitle = document.getElementById('login-subtitle');

    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        groupName.style.display = 'none';
        authBtn.textContent = 'Sign In';
        title.textContent = 'Customer Login';
        subtitle.textContent = 'Sign in to book and manage your deliveries';
    } else {
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
        groupName.style.display = 'block';
        authBtn.textContent = 'Create Profile';
        title.textContent = 'New Customer Registration';
        subtitle.textContent = 'Set up a local profile for smart scheduling';
    }
}

// ==========================================================================
// USER AUTH SIMULATION
// ==========================================================================
function handleAuthSubmit(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('auth-username').value.trim();
    const passwordInput = document.getElementById('auth-password').value;
    const nameInput = document.getElementById('auth-name').value.trim();
    const isRegister = document.getElementById('tab-register').classList.contains('active');

    if (isRegister) {
        // Register simulation
        if (!nameInput) {
            showToast("Please provide your full name to register.", "danger");
            return;
        }
        
        // Add to mock profile settings
        appState.currentUser = {
            username: usernameInput,
            name: nameInput,
            phone: '9876543210',
            address: 'Default St, City Center',
            role: usernameInput === 'admin' ? 'admin' : 'customer'
        };
        
        showToast(`Registration Successful! Welcome ${nameInput}.`, "success");
        speakText(`Welcome to LogiAI, ${nameInput}`);
    } else {
        // Login simulation
        if (usernameInput === 'admin') {
            if (passwordInput === 'admin123') {
                appState.currentUser = {
                    username: 'admin',
                    name: 'Platform Administrator',
                    role: 'admin'
                };
                showToast("Admin Console unlocked successfully.", "success");
                speakText("Logged in as administrator");
            } else {
                showToast("Invalid admin password. Try 'admin123'.", "danger");
                return;
            }
        } else {
            // Treat any other credential combinations as correct customer logs for convenience
            appState.currentUser = {
                username: usernameInput,
                name: usernameInput.charAt(0).toUpperCase() + usernameInput.slice(1) + " (Demo User)",
                phone: '9876543210',
                address: '123 Main St, Metroplex',
                role: 'customer'
            };
            showToast(`Welcome back, ${appState.currentUser.name}!`, "success");
            speakText(`Logged in as ${appState.currentUser.name}`);
        }
    }

    // Save and render navbar
    saveState();
    renderNavBar();
    
    // Redirect
    if (appState.currentUser.role === 'admin') {
        navigateTo('admin-panel');
    } else {
        // Fill profile inputs in settings too
        document.getElementById('settings-name').value = appState.currentUser.name;
        document.getElementById('settings-phone').value = appState.currentUser.phone || '';
        document.getElementById('settings-address').value = appState.currentUser.address || '';
        navigateTo('customer-dashboard');
    }

    // Clear form inputs
    document.getElementById('auth-form').reset();
}

function logoutUser() {
    if (appState.currentUser) {
        showToast(`Logged out from ${appState.currentUser.name}.`, "info");
        speakText("Logged out");
        appState.currentUser = null;
        saveState();
        renderNavBar();
        navigateTo('home');
    }
}

function renderNavBar() {
    const navDashboard = document.getElementById('nav-dashboard');
    const navBook = document.getElementById('nav-book');
    const navTrack = document.getElementById('nav-track');
    const navHistory = document.getElementById('nav-history');
    const navAnalytics = document.getElementById('nav-analytics');
    const navAdmin = document.getElementById('nav-admin');
    
    const userDisplay = document.getElementById('user-display');
    const loginBtn = document.getElementById('login-nav-btn');
    const logoutBtn = document.getElementById('logout-nav-btn');

    if (appState.currentUser) {
        userDisplay.style.display = 'inline';
        userDisplay.textContent = appState.currentUser.name;
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-flex';

        if (appState.currentUser.role === 'admin') {
            navAdmin.style.display = 'inline';
            navAnalytics.style.display = 'inline';
            navHistory.style.display = 'inline';
            navTrack.style.display = 'inline';
            navDashboard.style.display = 'none';
            navBook.style.display = 'none';
        } else {
            navAdmin.style.display = 'none';
            navAnalytics.style.display = 'none'; // Customer doesn't see system analytics
            navDashboard.style.display = 'inline';
            navBook.style.display = 'inline';
            navTrack.style.display = 'inline';
            navHistory.style.display = 'inline';
        }
    } else {
        userDisplay.style.display = 'none';
        loginBtn.style.display = 'inline-flex';
        logoutBtn.style.display = 'none';
        
        navDashboard.style.display = 'none';
        navBook.style.display = 'none';
        navTrack.style.display = 'none';
        navHistory.style.display = 'none';
        navAnalytics.style.display = 'none';
        navAdmin.style.display = 'none';
    }
}

// ==========================================================================
// SIMULATED AI ENGINE & SCORING
// ==========================================================================
function randomizeSimulatedConditions() {
    const traffics = ['Low', 'Medium', 'High'];
    const weathers = ['Sunny', 'Rainy', 'Stormy'];
    
    appState.simulatedConditions.traffic = traffics[Math.floor(Math.random() * traffics.length)];
    appState.simulatedConditions.weather = weathers[Math.floor(Math.random() * weathers.length)];
    appState.simulatedConditions.distance = parseFloat((Math.random() * 8 + 1.2).toFixed(1)); // 1.2km to 9.2km
    appState.simulatedConditions.historyScore = Math.floor(Math.random() * 20 + 80); // 80 to 99% accuracy

    // Render constants inside UI details card
    const trafficEl = document.getElementById('preview-traffic');
    const weatherEl = document.getElementById('preview-weather');
    const historyEl = document.getElementById('preview-history');
    const distEl = document.getElementById('preview-distance');

    if (trafficEl && weatherEl && historyEl && distEl) {
        trafficEl.textContent = `${appState.simulatedConditions.traffic} Traffic`;
        weatherEl.textContent = appState.simulatedConditions.weather;
        historyEl.textContent = `${appState.simulatedConditions.historyScore}% Positive Matches`;
        distEl.textContent = `${appState.simulatedConditions.distance} Km`;

        // Style elements based on parameters
        if (appState.simulatedConditions.traffic === 'High') {
            trafficEl.style.color = 'var(--color-danger)';
        } else if (appState.simulatedConditions.traffic === 'Medium') {
            trafficEl.style.color = 'var(--color-warning)';
        } else {
            trafficEl.style.color = 'var(--color-success)';
        }

        if (appState.simulatedConditions.weather === 'Stormy') {
            weatherEl.style.color = 'var(--color-danger)';
        } else if (appState.simulatedConditions.weather === 'Rainy') {
            weatherEl.style.color = 'var(--color-warning)';
        } else {
            weatherEl.style.color = 'var(--color-success)';
        }
    }
}

// Helper to determine slot recommended details
function calculateAISlotRecommendation(name, phone, address, type, weight, priority, date, timePref, instructions) {
    let traffic = appState.simulatedConditions.traffic;
    let weather = appState.simulatedConditions.weather;
    let distance = appState.simulatedConditions.distance;
    let histScore = appState.simulatedConditions.historyScore;

    // 1. Initial base score based on priority
    let priorityVal = 70;
    if (priority === 'Emergency') priorityVal = 100;
    if (priority === 'High') priorityVal = 85;

    // 2. Traffic modifications
    let trafficPenalty = 0;
    if (traffic === 'Medium') trafficPenalty = -10;
    if (traffic === 'High') trafficPenalty = -25;
    
    // Emergency priority bypasses 60% traffic penalty
    if (priority === 'Emergency') {
        trafficPenalty = Math.round(trafficPenalty * 0.4);
    }

    // 3. Weather modifications
    let weatherPenalty = 0;
    if (weather === 'Rainy') weatherPenalty = -15;
    if (weather === 'Stormy') weatherPenalty = -35;
    
    // 4. Distance modifications (-1.5 points per Km)
    let distancePenalty = Math.round(distance * -1.5);

    // 5. Customer History Weight (+15% of historical matching score)
    let historyWeight = Math.round(histScore * 0.15);

    // AI Recommendation Match Score
    let score = priorityVal + trafficPenalty + weatherPenalty + distancePenalty + historyWeight;
    // Cap score values
    score = Math.max(35, Math.min(100, score));

    // Recommend Time slots based on score & preferred ranges
    let recommendedSlot = '';
    let reasonList = [];
    let baseHour = 9; // Default starting hour is 9 AM

    if (timePref === 'Morning') {
        baseHour = (weather === 'Stormy') ? 11 : 10;
    } else if (timePref === 'Afternoon') {
        baseHour = (traffic === 'High') ? 14 : 13;
    } else { // Evening
        // If traffic is evening High and storm is raging, fallback to afternoon slot
        if (traffic === 'High' && weather === 'Stormy') {
            baseHour = 15; // Afternoon 3 PM bypass
            reasonList.push('Redirected to afternoon to bypass stormy evening traffic peak.');
        } else {
            baseHour = 17;
        }
    }

    // Emergency priority overrides preferences to deliver immediately (within 1-2 hours)
    if (priority === 'Emergency') {
        recommendedSlot = '08:00 AM - 09:00 AM';
        reasonList.push('Emergency priority override. Scheduled in first available morning slot.');
    } else {
        let hrString1 = baseHour > 12 ? `${baseHour - 12}:00 PM` : `${baseHour}:00 AM`;
        let hrString2 = (baseHour + 1) > 12 ? `${baseHour + 1 - 12}:00 PM` : `${baseHour + 1}:00 AM`;
        // Edge cases
        if (baseHour === 12) { hrString1 = '12:00 PM'; hrString2 = '1:00 PM'; }
        recommendedSlot = `${hrString1} - ${hrString2}`;
    }

    // Create reasons based on calculations
    if (traffic === 'Low') {
        reasonList.push('Optimal traffic conditions inside morning window.');
    } else if (traffic === 'Medium') {
        reasonList.push('Moderate traffic density. Estimated transit buffer: +15 mins.');
    } else {
        reasonList.push('Heavy traffic alerts bypassed through delivery scheduling offsets.');
    }

    if (weather === 'Sunny') {
        reasonList.push('Clear sunny day guarantees zero weather-related dispatch delays.');
    } else if (weather === 'Rainy') {
        reasonList.push('Wet weather. Scheduled slot accounts for slower speed restrictions.');
    } else {
        reasonList.push('Severe stormy weather forecast. Slot rescheduled close to dispatch depot.');
    }

    if (priority === 'Emergency' || priority === 'High') {
        reasonList.push('High priority classification routes item via premium courier logistics lanes.');
    } else {
        reasonList.push('Standard transit routing matching customer slot preferences.');
    }

    if (histScore > 90) {
        reasonList.push('Customer has excellent history of immediate receipt inside this window.');
    }

    // Expected exact ETA
    let etaHour = baseHour;
    let etaMin = Math.floor(Math.random() * 45 + 10); // Random 10 to 55 minutes past base
    let etaMinsStr = etaMin < 10 ? `0${etaMin}` : `${etaMin}`;
    let etaPeriod = etaHour >= 12 ? 'PM' : 'AM';
    let displayEtaHour = etaHour > 12 ? etaHour - 12 : etaHour;
    if (displayEtaHour === 0) displayEtaHour = 12;
    let etaVal = `${displayEtaHour}:${etaMinsStr} ${etaPeriod}`;

    return {
        id: 'TRK-' + Math.floor(100000 + Math.random() * 900000),
        customerName: name,
        phone: phone,
        address: address,
        parcelType: type,
        weight: parseFloat(weight),
        priority: priority,
        date: date,
        timePref: timePref,
        instructions: instructions,
        aiScore: score,
        recommendedSlot: recommendedSlot,
        confidence: score,
        eta: etaVal,
        status: 'Pending', // pending admin approval
        rating: 0,
        reasons: reasonList,
        timestamp: Date.now()
    };
}

// Adjust defaults in booking form depending on urgency
function adjustUrgencyFields() {
    const priority = document.getElementById('book-priority').value;
    const timePref = document.getElementById('book-time-pref');
    
    if (priority === 'Emergency') {
        timePref.value = 'Morning'; // default emergency to early slots
        showToast("Emergency flag locks schedules to the next available slot.", "info");
    }
}

// ==========================================================================
// BOOK DELIVERY HANDLERS
// ==========================================================================
let newlyGeneratedDelivery = null;

function handleBookingSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('book-customer-name').value;
    const phone = document.getElementById('book-phone').value;
    const address = document.getElementById('book-address').value;
    const type = document.getElementById('book-parcel-type').value;
    const weight = document.getElementById('book-weight').value;
    const priority = document.getElementById('book-priority').value;
    const date = document.getElementById('book-date').value;
    const timePref = document.getElementById('book-time-pref').value;
    const instructions = document.getElementById('book-instructions').value;

    // Show simulated loading processing screen modal
    const modal = document.getElementById('modal-ai-calculation');
    const loadingBody = document.getElementById('ai-modal-processing');
    const resultBody = document.getElementById('ai-modal-result');
    const stepText = document.getElementById('ai-loading-step');
    const progressBar = document.getElementById('ai-progress-bar');

    modal.classList.add('active');
    loadingBody.style.display = 'block';
    resultBody.style.display = 'none';
    progressBar.style.width = '0%';
    stepText.textContent = "Analyzing routing coordinates...";

    // Speak loading text
    speakText("Initiating AI slot optimization. Analyzing traffic and coordinates.");

    // Simulate progress bar phases
    setTimeout(() => {
        progressBar.style.width = '40%';
        stepText.textContent = "Fetching weather forecasts & traffic delays...";
    }, 1000);

    setTimeout(() => {
        progressBar.style.width = '80%';
        stepText.textContent = "Matching availability history vectors...";
    }, 2000);

    setTimeout(() => {
        progressBar.style.width = '100%';
        stepText.textContent = "Finalizing optimal slot metrics...";
        
        // Calculate result and save to newlyGeneratedDelivery reference
        newlyGeneratedDelivery = calculateAISlotRecommendation(
            name, phone, address, type, weight, priority, date, timePref, instructions
        );

        // Populate results fields in modal DOM
        document.getElementById('ai-result-trk-id').textContent = `Tracking ID: ${newlyGeneratedDelivery.id}`;
        document.getElementById('ai-result-score-val').textContent = newlyGeneratedDelivery.aiScore;
        document.getElementById('ai-result-slot').textContent = newlyGeneratedDelivery.recommendedSlot;
        document.getElementById('ai-result-confidence').textContent = `${newlyGeneratedDelivery.confidence}% Match`;
        document.getElementById('ai-result-eta').textContent = newlyGeneratedDelivery.eta;

        const reasonsBox = document.getElementById('ai-result-reasons');
        reasonsBox.innerHTML = '';
        newlyGeneratedDelivery.reasons.forEach(r => {
            reasonsBox.innerHTML += `
                <div class="ai-reason-item">
                    <span class="ai-reason-bullet">&#9670;</span>
                    <p style="color:var(--text-secondary); margin:0;">${r}</p>
                </div>
            `;
        });

        // Hide loader, show final optimized parameters
        loadingBody.style.display = 'none';
        resultBody.style.display = 'block';

        speakText(`Optimal slot calculated. recommended delivery time between ${newlyGeneratedDelivery.recommendedSlot}`);
    }, 3200);
}

function closeAIModalAndRedirect() {
    const modal = document.getElementById('modal-ai-calculation');
    modal.classList.remove('active');

    if (newlyGeneratedDelivery) {
        // Add new booking to global list
        appState.deliveries.unshift(newlyGeneratedDelivery);
        
        // Create custom system notification
        appState.notifications.unshift({
            text: `New parcel reservation ${newlyGeneratedDelivery.id} scheduled for ${newlyGeneratedDelivery.recommendedSlot}.`,
            type: newlyGeneratedDelivery.priority === 'Emergency' ? 'urgent' : 'primary',
            time: 'Just Now'
        });

        saveState();
        showToast(`Delivery ${newlyGeneratedDelivery.id} Saved! Pending Approval.`, "success");
        
        newlyGeneratedDelivery = null; // reset
    }

    // Refresh simulation details for next booking
    randomizeSimulatedConditions();
    
    // Redirect to customer dashboard
    navigateTo('customer-dashboard');
}

// ==========================================================================
// RENDER CUSTOMER DASHBOARD
// ==========================================================================
function updateDashboardMetrics() {
    if (!appState.currentUser) return;
    const nameEl = document.getElementById('dash-customer-name');
    if (nameEl) nameEl.textContent = appState.currentUser.name;

    // Filter pending/transit vs history
    const customerName = appState.currentUser.name;
    const pendingList = appState.deliveries.filter(d => 
        (d.customerName === customerName || appState.currentUser.username === 'customer') && 
        (d.status === 'Pending' || d.status === 'Transit')
    );

    const pendingCountEl = document.getElementById('dash-pending-count');
    if (pendingCountEl) pendingCountEl.textContent = pendingList.length;

    // Set recommended slot on dashboard banner based on first pending item or a mock default
    const recommendedSlotEl = document.getElementById('dash-recommended-slot');
    const confidenceEl = document.getElementById('dash-confidence');
    
    if (pendingList.length > 0 && pendingList[0].recommendedSlot) {
        recommendedSlotEl.textContent = pendingList[0].recommendedSlot;
        confidenceEl.textContent = `${pendingList[0].confidence}%`;
    } else {
        recommendedSlotEl.textContent = '10:00 AM - 12:00 PM';
        confidenceEl.textContent = '94%';
    }
}

function renderDashboardDeliveries() {
    updateDashboardMetrics();
    
    const todayList = document.getElementById('dash-today-deliveries');
    const upcomingList = document.getElementById('dash-upcoming-deliveries');
    if (!todayList || !upcomingList) return;

    // Filter deliveries based on current user
    const customerName = appState.currentUser.name;
    const userDeliveries = appState.deliveries.filter(d => 
        d.customerName === customerName || appState.currentUser.username === 'customer'
    );

    // Get today's local date string
    const todayStr = new Date().toISOString().split('T')[0];

    // Partition
    const todayItems = userDeliveries.filter(d => d.date === todayStr);
    const upcomingItems = userDeliveries.filter(d => d.date > todayStr);

    // Helper to generate list item HTML
    const getDeliveryItemHTML = (d) => {
        let badgeClass = 'badge-pending';
        if (d.status === 'Transit') badgeClass = 'badge-completed'; // out for delivery
        if (d.status === 'Completed') badgeClass = 'badge-completed';
        if (d.status === 'Cancelled') badgeClass = 'badge-cancelled';

        return `
            <div class="delivery-item">
                <div class="delivery-item-icon">
                    <svg viewBox="0 0 24 24" style="width:22px; height:22px; fill:currentColor;"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
                </div>
                <div class="delivery-item-details">
                    <h4>${d.parcelType} (${d.weight} Kg)</h4>
                    <p>Track ID: <span style="color:var(--color-secondary); font-weight:600;">${d.id}</span> | Target Slot: ${d.recommendedSlot}</p>
                </div>
                <span class="badge ${badgeClass}">${d.status}</span>
                <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="openTrackerWithID('${d.id}')">Track</button>
            </div>
        `;
    };

    // Render lists
    todayList.innerHTML = todayItems.length > 0 
        ? todayItems.map(getDeliveryItemHTML).join('') 
        : '<p style="color:var(--text-muted); padding:10px;">No scheduled parcel drop-offs recorded for today.</p>';

    upcomingList.innerHTML = upcomingItems.length > 0 
        ? upcomingItems.map(getDeliveryItemHTML).join('') 
        : '<p style="color:var(--text-muted); padding:10px;">No upcoming future shipments scheduled.</p>';
}

// ==========================================================================
// TRACK PARCEL MODULE
// ==========================================================================
let countdownInterval = null;

function openTrackerWithID(trackingId) {
    navigateTo('track-parcel');
    document.getElementById('track-id-input').value = trackingId;
    handleTrackSearch();
}

function handleTrackSearch() {
    const id = document.getElementById('track-id-input').value.trim();
    if (!id) {
        showToast("Please enter a valid tracking ID first.", "warning");
        return;
    }

    const parcel = appState.deliveries.find(d => d.id === id);
    if (!parcel) {
        showToast("Tracking ID not found in system databases.", "danger");
        return;
    }

    // Toggle track view details
    document.getElementById('track-placeholder').style.display = 'none';
    document.getElementById('track-details-container').style.display = 'block';

    // Populate data fields
    document.getElementById('track-parcel-label').textContent = `${parcel.parcelType} Package`;
    document.getElementById('track-parcel-id-display').textContent = parcel.id;
    document.getElementById('track-slot-val').textContent = parcel.recommendedSlot;
    document.getElementById('track-eta-val').textContent = `${parcel.date} at ${parcel.eta}`;
    document.getElementById('track-confidence-val').textContent = `${parcel.confidence}% AI Accuracy`;

    const statusBadge = document.getElementById('track-status-badge');
    statusBadge.textContent = parcel.status;
    statusBadge.className = 'badge';
    if (parcel.status === 'Pending') statusBadge.classList.add('badge-pending');
    if (parcel.status === 'Transit') statusBadge.classList.add('badge-completed');
    if (parcel.status === 'Completed') statusBadge.classList.add('badge-completed');
    if (parcel.status === 'Cancelled') statusBadge.classList.add('badge-cancelled');

    // Handle Timeline Steps Active status & connected fills
    updateTimelineUI(parcel.status);

    // Render Canvas QR Verification Code
    generateQRTokenOnCanvas('qr-code-canvas', parcel.id);
    generateQRTokenOnCanvas('qr-code-canvas-print', parcel.id);

    // Prepare printable receipt template values
    document.getElementById('print-receipt-no').textContent = `REC-${Math.floor(10000000 + Math.random() * 90000000)}`;
    document.getElementById('print-tracking-id').textContent = parcel.id;
    document.getElementById('print-recipient-name').textContent = parcel.customerName;
    document.getElementById('print-address').textContent = parcel.address;
    document.getElementById('print-phone').textContent = parcel.phone;
    document.getElementById('print-parcel-type').textContent = parcel.parcelType;
    document.getElementById('print-weight').textContent = `${parcel.weight} Kg`;
    document.getElementById('print-priority').textContent = `${parcel.priority} Urgency`;
    document.getElementById('print-date').textContent = parcel.date;
    document.getElementById('print-recommended-slot').textContent = parcel.recommendedSlot;
    document.getElementById('print-confidence').textContent = `${parcel.confidence}% Match Rate`;
    document.getElementById('print-eta').textContent = parcel.eta;
    document.getElementById('print-status').textContent = parcel.status;

    // Start Live Vehicle Driving Simulation (updates layout truck left css property)
    animateTransitVehicle(parcel.status);

    // Setup Countdown timer countdown
    startCountdownTimer(parcel.recommendedSlot, parcel.status);
}

function updateTimelineUI(status) {
    const steps = ['ordered', 'packed', 'transit', 'nearby', 'delivered'];
    
    // Map statuses to step index threshold
    let activeThreshold = 0; // default Ordered
    if (status === 'Pending') activeThreshold = 1; // Packed
    if (status === 'Transit') activeThreshold = 2; // Transit
    if (status === 'Delivered' || status === 'Completed') activeThreshold = 4; // Delivered
    if (status === 'Cancelled') activeThreshold = -1; // Reset

    steps.forEach((step, idx) => {
        const stepEl = document.getElementById(`step-${step}`);
        if (!stepEl) return;

        stepEl.classList.remove('completed', 'active');
        if (idx < activeThreshold) {
            stepEl.classList.add('completed');
        } else if (idx === activeThreshold) {
            stepEl.classList.add('active');
        }
    });

    // Timeline Line Fill % mapping
    const fillEl = document.getElementById('track-timeline-fill');
    if (fillEl) {
        let percent = 0;
        if (activeThreshold === 0) percent = 0;
        if (activeThreshold === 1) percent = 25;
        if (activeThreshold === 2) percent = 50;
        if (activeThreshold === 4) percent = 100;
        
        // Handle desktop vs mobile dimensions dynamically
        if (window.innerWidth <= 768) {
            fillEl.style.width = '4px';
            fillEl.style.height = `${percent}%`;
        } else {
            fillEl.style.height = '4px';
            fillEl.style.width = `${percent}%`;
        }
    }
}

function animateTransitVehicle(status) {
    const vehicle = document.getElementById('sim-vehicle');
    if (!vehicle) return;

    vehicle.style.left = '0%'; // initial position
    
    if (status === 'Pending') {
        vehicle.style.left = '25%';
    } else if (status === 'Transit') {
        // Animate truck driving continuously slightly forwards/backwards representing transit
        vehicle.style.left = '50%';
        let drift = true;
        
        // Simple drift loop simulation
        if (window.driftInterval) clearInterval(window.driftInterval);
        window.driftInterval = setInterval(() => {
            if (appState.currentPage !== 'track-parcel') {
                clearInterval(window.driftInterval);
                return;
            }
            vehicle.style.left = drift ? '54%' : '48%';
            drift = !drift;
        }, 3000);
        
    } else if (status === 'Completed' || status === 'Delivered') {
        vehicle.style.left = '90%';
    } else {
        vehicle.style.left = '0%';
    }
}

function startCountdownTimer(slotRange, status) {
    if (countdownInterval) clearInterval(countdownInterval);
    const countdownValEl = document.getElementById('track-countdown');

    if (status === 'Completed' || status === 'Delivered') {
        countdownValEl.textContent = "DELIVERED";
        countdownValEl.style.color = "var(--color-success)";
        return;
    }
    if (status === 'Cancelled') {
        countdownValEl.textContent = "CANCELLED";
        countdownValEl.style.color = "var(--color-danger)";
        return;
    }

    countdownValEl.style.color = "var(--color-primary)";

    // Parse the recommended slot time (e.g. "10:00 AM - 11:00 AM")
    // Mock countdown: set to 1 hour and 24 minutes countdown for presentation purposes
    let totalSeconds = 5040; // 1hr 24mins

    countdownInterval = setInterval(() => {
        if (appState.currentPage !== 'track-parcel') {
            clearInterval(countdownInterval);
            return;
        }

        if (totalSeconds <= 0) {
            clearInterval(countdownInterval);
            countdownValEl.textContent = "ARRIVED";
            return;
        }

        totalSeconds--;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const hStr = hours < 10 ? `0${hours}` : hours;
        const mStr = minutes < 10 ? `0${minutes}` : minutes;
        const sStr = seconds < 10 ? `0${seconds}` : seconds;

        countdownValEl.textContent = `${hStr}:${mStr}:${sStr}`;
    }, 1000);
}

// Generate Delivery QR Code (pure JS canvas writing block)
function generateQRTokenOnCanvas(canvasId, text) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Simple grid layout version 1 (21x21 squares)
    const gridSize = 21;
    const cellSize = Math.floor((width - 12) / gridSize);
    const offset = 6;

    // Helper to draw corners (7x7 positioning indicators)
    const drawCorner = (x, y) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(offset + x * cellSize, offset + y * cellSize, 7 * cellSize, 7 * cellSize);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(offset + (x + 1) * cellSize, offset + (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(offset + (x + 2) * cellSize, offset + (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    // Draw three standard QR corner anchors
    drawCorner(0, 0); // Top-left
    drawCorner(gridSize - 7, 0); // Top-right
    drawCorner(0, gridSize - 7); // Bottom-left

    // Generate deterministic pseudo-random blocks seeded by tracking string hash code
    let seed = 0;
    for (let i = 0; i < text.length; i++) {
        seed += text.charCodeAt(i);
    }

    const random = () => {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    // Fill remaining grid areas
    ctx.fillStyle = '#000000';
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            // Bypass areas covered by corner indicators
            if (row < 8 && col < 8) continue;
            if (row < 8 && col > gridSize - 9) continue;
            if (row > gridSize - 9 && col < 8) continue;

            // Pseudo-random cell fill decision
            if (random() > 0.5) {
                ctx.fillRect(offset + col * cellSize, offset + row * cellSize, cellSize, cellSize);
            }
        }
    }
}

// PRINT RECEIPT helper
function triggerReceiptPrint() {
    window.print();
}

// ==========================================================================
// SHIPMENT REPOSITORY (DELIVERY HISTORY)
// ==========================================================================
function handleHistoryFiltersChange() {
    appState.historyPage = 1; // reset page on filter change
    renderHistoryTable();
}

function handleHistoryPageChange(direction) {
    appState.historyPage += direction;
    renderHistoryTable();
}

function renderHistoryTable() {
    const tbody = document.getElementById('history-table-body');
    const searchVal = document.getElementById('history-search').value.toLowerCase();
    const filterStatus = document.getElementById('history-filter-status').value;
    const sortVal = document.getElementById('history-sort').value;
    if (!tbody) return;

    // Filter based on user profile and criteria
    let filtered = appState.deliveries;
    if (appState.currentUser && appState.currentUser.role !== 'admin') {
        const customerName = appState.currentUser.name;
        filtered = filtered.filter(d => d.customerName === customerName || appState.currentUser.username === 'customer');
    }

    if (searchVal) {
        filtered = filtered.filter(d => 
            d.id.toLowerCase().includes(searchVal) ||
            d.customerName.toLowerCase().includes(searchVal) ||
            d.address.toLowerCase().includes(searchVal) ||
            d.parcelType.toLowerCase().includes(searchVal)
        );
    }

    if (filterStatus !== 'All') {
        filtered = filtered.filter(d => d.status === filterStatus);
    }

    // Sort operations
    if (sortVal === 'newest') {
        filtered.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortVal === 'oldest') {
        filtered.sort((a, b) => a.timestamp - b.timestamp);
    } else if (sortVal === 'weight-desc') {
        filtered.sort((a, b) => b.weight - a.weight);
    } else if (sortVal === 'weight-asc') {
        filtered.sort((a, b) => a.weight - b.weight);
    }

    // Pagination calculations
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / appState.historyLimit) || 1;
    
    // Bounds check page range
    appState.historyPage = Math.max(1, Math.min(totalPages, appState.historyPage));
    
    const startIndex = (appState.historyPage - 1) * appState.historyLimit;
    const paginatedItems = filtered.slice(startIndex, startIndex + appState.historyLimit);

    // Update Pagination labels
    document.getElementById('history-page-info').textContent = `Page ${appState.historyPage} of ${totalPages}`;
    document.getElementById('btn-page-prev').disabled = appState.historyPage === 1;
    document.getElementById('btn-page-next').disabled = appState.historyPage === totalPages;

    // Draw dynamic rows
    tbody.innerHTML = '';
    if (paginatedItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No matching parcel shipments found.</td></tr>`;
        return;
    }

    paginatedItems.forEach(d => {
        let badgeStatusClass = 'badge-pending';
        if (d.status === 'Transit') badgeStatusClass = 'badge-completed';
        if (d.status === 'Completed') badgeStatusClass = 'badge-completed';
        if (d.status === 'Cancelled') badgeStatusClass = 'badge-cancelled';

        let badgePriorityClass = 'badge-pending';
        if (d.priority === 'High') badgePriorityClass = 'badge-priority';
        if (d.priority === 'Emergency') badgePriorityClass = 'badge-cancelled'; // red label

        let trackingCol = `<a href="#" onclick="openTrackerWithID('${d.id}')" style="color:var(--color-secondary); font-weight:600; text-decoration:underline;">${d.id}</a>`;

        tbody.innerHTML += `
            <tr>
                <td>${trackingCol}</td>
                <td>
                    <div style="font-weight:600;">${d.customerName}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${d.phone}</div>
                </td>
                <td>
                    <div>${d.parcelType}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${d.weight} Kg</div>
                </td>
                <td>
                    <span class="badge ${badgePriorityClass} badge-priority">${d.priority}</span>
                </td>
                <td>
                    <div style="font-weight:600;">${d.recommendedSlot}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${d.date}</div>
                </td>
                <td>
                    <span class="badge ${badgeStatusClass}">${d.status}</span>
                </td>
                <td>
                    <button class="btn btn-secondary" style="padding:4px 8px; font-size:0.75rem;" onclick="openTrackerWithID('${d.id}')">Track</button>
                </td>
            </tr>
        `;
    });
}

// ==========================================================================
// ADMIN CONTROL CONSOLE PANEL
// ==========================================================================
function updateAdminStats() {
    const total = appState.deliveries.length;
    const pending = appState.deliveries.filter(d => d.status === 'Pending').length;
    const transit = appState.deliveries.filter(d => d.status === 'Transit').length;
    const completed = appState.deliveries.filter(d => d.status === 'Completed' || d.status === 'Delivered').length;

    // Match rate calculation is simulated base average
    const accuracy = total > 0 ? parseFloat((100 - (pending / total) * 5).toFixed(1)) : 94.5;

    // Write values to DOM if elements exist
    const totalEl = document.getElementById('admin-total-val');
    const pendingEl = document.getElementById('admin-pending-val');
    const transitEl = document.getElementById('admin-transit-val');
    const completedEl = document.getElementById('admin-completed-val');
    const aiEl = document.getElementById('admin-ai-val');

    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending;
    if (transitEl) transitEl.textContent = transit;
    if (completedEl) completedEl.textContent = completed;
    if (aiEl) aiEl.textContent = `${accuracy}%`;
}

function renderAdminQueue() {
    const tbody = document.getElementById('admin-table-body');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (appState.deliveries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:var(--text-muted);">No deliveries booked.</td></tr>';
        return;
    }

    appState.deliveries.forEach(d => {
        let badgeClass = 'badge-pending';
        if (d.status === 'Transit') badgeClass = 'badge-completed';
        if (d.status === 'Completed') badgeClass = 'badge-completed';
        if (d.status === 'Cancelled') badgeClass = 'badge-cancelled';

        // Action buttons based on status
        let actionsHTML = '';
        if (d.status === 'Pending') {
            actionsHTML = `
                <div class="action-buttons">
                    <button class="btn btn-primary action-btn-sm" onclick="setAdminStatus('${d.id}', 'Transit')">Approve</button>
                    <button class="btn btn-danger action-btn-sm" onclick="setAdminStatus('${d.id}', 'Cancelled')">Reject</button>
                </div>
            `;
        } else if (d.status === 'Transit') {
            actionsHTML = `
                <div class="action-buttons">
                    <button class="btn btn-secondary action-btn-sm" style="border-color:var(--color-success); color:var(--color-success);" onclick="setAdminStatus('${d.id}', 'Completed')">Complete</button>
                </div>
            `;
        } else {
            actionsHTML = `<span style="font-size:0.8rem; color:var(--text-muted);">No actions</span>`;
        }

        tbody.innerHTML += `
            <tr>
                <td style="color:var(--color-secondary); font-weight:600;">${d.id}</td>
                <td>
                    <div style="font-weight:600;">${d.customerName}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${d.address}</div>
                </td>
                <td>${d.parcelType}</td>
                <td>${d.weight} Kg</td>
                <td><span class="badge badge-priority">${d.priority}</span></td>
                <td>${d.recommendedSlot}</td>
                <td><span class="badge ${badgeClass}">${d.status}</span></td>
                <td>${actionsHTML}</td>
            </tr>
        `;
    });
}

function setAdminStatus(id, newStatus) {
    const parcel = appState.deliveries.find(d => d.id === id);
    if (parcel) {
        parcel.status = newStatus;
        
        // Notify customer
        appState.notifications.unshift({
            text: `Parcel ${parcel.id} status updated to ${newStatus} by Administrator.`,
            type: newStatus === 'Cancelled' ? 'urgent' : 'system',
            time: 'Just Now'
        });

        saveState();
        renderAdminQueue();
        updateAdminStats();
        showToast(`Parcel ${id} marked as ${newStatus}!`, "success");
        speakText(`Parcel status updated to ${newStatus}`);
    }
}

// ==========================================================================
// AI ANALYTICS MODULE (PURE CANVAS GRAPH RENDERING)
// ==========================================================================
function renderAnalyticsCharts() {
    renderLineChart();
    renderBarChart();
    renderHorizontalChart();
    renderPieChart();
}

// Canvas Chart 1: Line Chart (Deliveries per Day)
function renderLineChart() {
    const canvas = document.getElementById('chart-daily-deliveries');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Scale for high dpi displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    
    // Clear canvas & fill dark background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, w, h);

    // Seed/calculate bookings per day count
    // Dates: 08-03, 08-04, 08-05, 08-06, 08-07, 08-08
    const labels = ['Aug 3', 'Aug 4', 'Aug 5', 'Aug 6', 'Aug 7', 'Aug 8'];
    const data = [2, 5, 8, 4, 9, 6]; // Mock dataset matching history logs

    const paddingLeft = 40;
    const paddingBottom = 30;
    const paddingTop = 20;
    const paddingRight = 20;

    const chartW = w - paddingLeft - paddingRight;
    const chartH = h - paddingTop - paddingBottom;

    // Draw Axes grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    const gridRows = 4;
    for (let i = 0; i <= gridRows; i++) {
        let gridY = paddingTop + (chartH / gridRows) * i;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, gridY);
        ctx.lineTo(w - paddingRight, gridY);
        ctx.stroke();

        // Write Y value labels
        ctx.fillStyle = 'var(--text-muted)';
        ctx.font = '10px sans-serif';
        let val = Math.round(10 - (10 / gridRows) * i);
        ctx.fillText(val, paddingLeft - 22, gridY + 3);
    }

    // Coordinates mapping
    const points = [];
    const stepX = chartW / (labels.length - 1);
    for (let i = 0; i < data.length; i++) {
        let px = paddingLeft + stepX * i;
        let py = paddingTop + chartH - (data[i] / 10) * chartH;
        points.push({ x: px, y: py });
    }

    // Fill area gradient underneath line
    const areaGrd = ctx.createLinearGradient(0, paddingTop, 0, h - paddingBottom);
    areaGrd.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    areaGrd.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, h - paddingBottom);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h - paddingBottom);
    ctx.closePath();
    ctx.fillStyle = areaGrd;
    ctx.fill();

    // Draw Plot Lines
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Draw Circles & Labels
    points.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.stroke();

        // X Labels
        ctx.fillStyle = 'var(--text-muted)';
        ctx.font = '10px sans-serif';
        ctx.fillText(labels[idx], p.x - 14, h - paddingBottom + 18);
    });
}

// Canvas Chart 2: Vertical Bar Chart (Slot Preferred)
function renderBarChart() {
    const canvas = document.getElementById('chart-preferred-slots');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, w, h);

    const labels = ['Morning', 'Afternoon', 'Evening'];
    const data = [14, 8, 12]; // count values

    const paddingLeft = 40;
    const paddingBottom = 30;
    const paddingTop = 20;
    const paddingRight = 20;

    const chartW = w - paddingLeft - paddingRight;
    const chartH = h - paddingTop - paddingBottom;

    // Draw Y Axes values grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
        let gridY = paddingTop + (chartH / 3) * i;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, gridY);
        ctx.lineTo(w - paddingRight, gridY);
        ctx.stroke();

        ctx.fillStyle = 'var(--text-muted)';
        ctx.font = '10px sans-serif';
        let val = Math.round(15 - 5 * i);
        ctx.fillText(val, paddingLeft - 22, gridY + 3);
    }

    // Draw Bars
    const barSpacing = chartW / labels.length;
    const barWidth = 40;

    data.forEach((val, idx) => {
        let barH = (val / 15) * chartH;
        let bx = paddingLeft + barSpacing * idx + (barSpacing - barWidth) / 2;
        let by = paddingTop + chartH - barH;

        // Custom Gradient
        const barGrd = ctx.createLinearGradient(0, by, 0, by + barH);
        barGrd.addColorStop(0, '#06b6d4');
        barGrd.addColorStop(1, 'rgba(6, 182, 212, 0.2)');

        ctx.fillStyle = barGrd;
        // Rounded bar top
        ctx.beginPath();
        ctx.roundRect(bx, by, barWidth, barH, [4, 4, 0, 0]);
        ctx.fill();

        // Labels
        ctx.fillStyle = 'var(--text-muted)';
        ctx.font = '10px sans-serif';
        ctx.fillText(labels[idx], bx + barWidth / 2 - 20, h - paddingBottom + 18);

        // Value text on top
        ctx.fillStyle = 'var(--text-primary)';
        ctx.fillText(val, bx + barWidth / 2 - 5, by - 6);
    });
}

// Canvas Chart 3: Horizontal Bars (Traffic Delay index)
function renderHorizontalChart() {
    const canvas = document.getElementById('chart-traffic-analysis');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, w, h);

    const labels = ['Low Traffic', 'Medium Traffic', 'High Traffic'];
    const delayMins = [8, 22, 48]; // Average delay

    const paddingLeft = 100;
    const paddingRight = 40;
    const paddingTop = 30;
    const paddingBottom = 20;

    const chartW = w - paddingLeft - paddingRight;
    const chartH = h - paddingTop - paddingBottom;

    const barHeight = 24;
    const spacing = chartH / labels.length;

    labels.forEach((label, idx) => {
        let barW = (delayMins[idx] / 50) * chartW;
        let by = paddingTop + spacing * idx + (spacing - barHeight) / 2;
        let bx = paddingLeft;

        // Colors
        let color = '#10b981'; // Green
        if (idx === 1) color = '#f59e0b'; // Amber
        if (idx === 2) color = '#ef4444'; // Red

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(bx, by, barW, barHeight, [0, 4, 4, 0]);
        ctx.fill();

        // Y Labels
        ctx.fillStyle = 'var(--text-primary)';
        ctx.font = '10px sans-serif';
        ctx.fillText(label, 10, by + 16);

        // Value text
        ctx.fillStyle = 'var(--text-primary)';
        ctx.fillText(`${delayMins[idx]}m delay`, bx + barW + 8, by + 16);
    });
}

// Canvas Chart 4: Pie Donut Chart (Success Rates)
function renderPieChart() {
    const canvas = document.getElementById('chart-success-rate');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, w, h);

    const data = [76, 18, 6]; // On-time, Delayed, Missed
    const colors = ['#10b981', '#f59e0b', '#ef4444'];
    const labels = ['On-Time (76%)', 'Delayed (18%)', 'Missed (6%)'];

    const centerX = w / 2 - 40;
    const centerY = h / 2;
    const radius = Math.min(w, h) / 2.6;

    let total = 0;
    data.forEach(val => total += val);

    let startAngle = 0;
    data.forEach((val, idx) => {
        let sliceAngle = (val / total) * 2 * Math.PI;

        ctx.fillStyle = colors[idx];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();

        startAngle += sliceAngle;
    });

    // Donut Cutout
    ctx.fillStyle = appState.currentUser ? 'var(--bg-surface-solid)' : '#111827';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fill();

    // Draw Legends side list
    const legendX = centerX + radius + 20;
    const legendYStart = centerY - 30;
    labels.forEach((label, idx) => {
        let ly = legendYStart + 22 * idx;

        // Color indicator rect
        ctx.fillStyle = colors[idx];
        ctx.fillRect(legendX, ly, 12, 12);

        // Label string
        ctx.fillStyle = 'var(--text-primary)';
        ctx.font = '11px sans-serif';
        ctx.fillText(label, legendX + 20, ly + 10);
    });
}

// ==========================================================================
// HOME PAGE STATISTICS COUNTER ANIMATIONS
// ==========================================================================
function runCountingAnimation() {
    const totalEl = document.getElementById('stat-deliveries');
    const accuracyEl = document.getElementById('stat-accuracy');
    const efficiencyEl = document.getElementById('stat-efficiency');
    const ratingEl = document.getElementById('stat-rating');

    if (!totalEl || !accuracyEl || !efficiencyEl || !ratingEl) return;

    animateCount(totalEl, 0, 1420, 2000, '');
    animateCount(accuracyEl, 0, 94.5, 2000, '%', 1);
    animateCount(efficiencyEl, 0, 38, 2000, '%');
    animateCount(ratingEl, 0, 4.8, 2000, '', 1);
}

function animateCount(element, start, end, duration, suffix = '', decimals = 0) {
    let startTime = null;

    const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentVal = progress * (end - start) + start;
        
        element.textContent = currentVal.toFixed(decimals) + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.textContent = end.toFixed(decimals) + suffix;
        }
    };

    window.requestAnimationFrame(step);
}

// ==========================================================================
// TOAST NOTIFICATIONS & SPEECH SYNTHESIS VOICE ASSISTANT
// ==========================================================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Settings filter check
    const toggle = document.getElementById('noti-switch');
    if (toggle && !toggle.checked) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Slide in
    setTimeout(() => toast.classList.add('show'), 100);

    // Slide out and remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

function speakText(text) {
    // Settings check
    const toggle = document.getElementById('voice-switch');
    if (toggle && !toggle.checked) return;

    if ('speechSynthesis' in window) {
        // Cancel ongoing speak queries to prevent queuing lags
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05; // natural rate
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    }
}

// ==========================================================================
// INTERACTIVE AI ASSISTANT CHAT WIDGET
// ==========================================================================
function toggleChatbotWindow() {
    const chatWin = document.getElementById('chatbot-window');
    if (chatWin) {
        chatWin.classList.toggle('active');
        if (chatWin.classList.contains('active')) {
            speakText("Chat assistant active. How can I help you today?");
        }
    }
}

function sendBotCommand(text) {
    document.getElementById('chatbot-input-msg').value = text;
    handleSendBotMessage();
}

function handleSendBotMessage() {
    const inputEl = document.getElementById('chatbot-input-msg');
    const msg = inputEl.value.trim();
    if (!msg) return;

    // Append outgoing user message
    appendChatMessage(msg, 'outgoing');
    inputEl.value = '';

    // Append loading typing bubble
    const typingIndicator = appendChatTyping();

    // Formulate response after delay
    setTimeout(() => {
        typingIndicator.remove();
        const reply = getRuleBasedBotReply(msg);
        appendChatMessage(reply, 'incoming');
        
        // Auto scroll to bottom
        const box = document.getElementById('chatbot-messages-box');
        if (box) box.scrollTop = box.scrollHeight;

        // Speak chatbot response text
        // Clean speech text slightly from extra syntax
        const speechStr = reply.replace(/<\/?[^>]+(>|$)/g, ""); // strip HTML tags
        speakText(speechStr);
    }, 1200);
}

function appendChatMessage(text, sender) {
    const box = document.getElementById('chatbot-messages-box');
    if (!box) return;

    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;
    div.innerHTML = text;
    box.appendChild(div);

    box.scrollTop = box.scrollHeight;
}

function appendChatTyping() {
    const box = document.getElementById('chatbot-messages-box');
    if (!box) return null;

    const div = document.createElement('div');
    div.className = 'chat-msg incoming typing-indicator';
    div.innerHTML = `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
    `;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
    return div;
}

function getRuleBasedBotReply(query) {
    const q = query.toLowerCase();

    if (q.includes('how') && q.includes('recommend') || q.includes('how does the ai')) {
        return "Our simulated AI scheduler optimizes slot allocations out of 100. It adds weight coefficients for priority, and subtracts negative penalties for heavy evening traffic density, rainy/stormy weather conditions, and far delivery transit distances.";
    }
    if (q.includes('track') || q.includes('locate')) {
        return "To track a parcel, visit the <b>Track Page</b> from the navigation menu and enter your tracking ID (e.g. <i>TRK-100293</i>). It displays live route animations, countdown clocks, and download receipts.";
    }
    if (q.includes('recommended slot') || q.includes('today')) {
        if (appState.currentUser) {
            // Find first pending item
            const parcel = appState.deliveries.find(d => 
                (d.customerName === appState.currentUser.name || appState.currentUser.username === 'customer') &&
                d.status !== 'Completed' && d.status !== 'Cancelled'
            );
            if (parcel) {
                return `Your next scheduled delivery (${parcel.id}) is set for <b>${parcel.recommendedSlot}</b> with a score of ${parcel.confidence}% match accuracy.`;
            }
            return "You have no active shipments today. Set one up under the <b>Book Delivery</b> tab!";
        }
        return "Please sign in to your customer profile to inspect customized slot recommendations.";
    }
    if (q.includes('weather') || q.includes('traffic')) {
        return `Current simulated constants: Traffic is <b>${appState.simulatedConditions.traffic}</b> | Weather is <b>${appState.simulatedConditions.weather}</b>. This will shift matching probabilities for booking slots.`;
    }
    if (q.includes('admin') || q.includes('control')) {
        return "Administrator accounts can approve pending requests (moving them into Transit), cancel bookings, and verify global metrics. Use credentials <i>admin / admin123</i> to explore administrative layouts.";
    }
    if (q.includes('book') || q.includes('schedule')) {
        return "You can reserve delivery slots on the <b>Book Delivery Page</b>. Fill out the parcel details and priority urgency to trigger AI slot matching recommendations.";
    }
    if (q.includes('stats') || q.includes('accuracy')) {
        return `Current statistics show <b>1420+</b> optimizations processed with an average match rate of <b>94.5%</b>. Check the admin console or charts dashboard for more details.`;
    }
    if (q.includes('hello') || q.includes('hi ') || q.includes('hey')) {
        return "Hello! How can I assist you with parcel slot bookings or tracking simulations today?";
    }
    
    // Fallback response
    return "I'm not sure about that query. You can ask me how to track, how booking works, or current weather/traffic simulation settings!";
}

// ==========================================================================
// SETTINGS & PROFILE UPDATE
// ==========================================================================
function handleThemeSwitchToggle() {
    const isChecked = document.getElementById('theme-switch').checked;
    const body = document.body;
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    if (isChecked) {
        body.setAttribute('data-theme', 'light');
        sunIcon.style.display = 'inline';
        moonIcon.style.display = 'none';
        showToast("Switched to Light Mode theme.", "info");
    } else {
        body.setAttribute('data-theme', 'dark');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'inline';
        showToast("Switched to Dark Mode theme.", "info");
    }
    
    // Retain settings locally inside storage
    saveState();
    
    // Redraw charts since text labels colors adapt to body background theme changes
    if (appState.currentPage === 'ai-analytics') {
        renderAnalyticsCharts();
    }
}

// Toggle navigation theme matches on click navbar
function toggleTheme() {
    const checkbox = document.getElementById('theme-switch');
    if (checkbox) {
        checkbox.checked = !checkbox.checked;
        handleThemeSwitchToggle();
    }
}

function toggleNotificationsPanel() {
    // Show active notifications logs in a quick warning toast list or alerts list
    if (appState.notifications.length === 0) {
        showToast("No active notification messages.", "info");
        return;
    }
    
    // Display all notifications in standard alerts
    let logs = appState.notifications.slice(0, 4).map(n => `[${n.time}] ${n.text}`).join('\n');
    alert(`System Notifications Logs:\n\n${logs}`);
}

function handleProfileUpdate(event) {
    event.preventDefault();
    if (!appState.currentUser) return;

    const name = document.getElementById('settings-name').value;
    const phone = document.getElementById('settings-phone').value;
    const address = document.getElementById('settings-address').value;

    appState.currentUser.name = name;
    appState.currentUser.phone = phone;
    appState.currentUser.address = address;

    // Update global deliveries names too if customer
    if (appState.currentUser.role !== 'admin') {
        appState.deliveries.forEach(d => {
            if (d.customerName === 'Alex Mercer') {
                d.customerName = name; // Update default demo name to actual user profile
            }
        });
    }

    saveState();
    renderNavBar();
    showToast("User Profile updated successfully!", "success");
    speakText("Profile details saved.");
}

// Helper to scroll to section smoothly on home page clicks
function scrollToElement(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// Setup static DOM click handlers & initial triggers
function setupEventListeners() {
    // Redraw graphs automatically on window size changes to support fluid layouts
    window.addEventListener('resize', () => {
        if (appState.currentPage === 'ai-analytics') {
            renderAnalyticsCharts();
        }
    });
}
