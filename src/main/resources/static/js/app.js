/**
 * EventPulse - Event Management System
 * Main Application JavaScript
 */
document.addEventListener('DOMContentLoaded', function() {
    // Global state
    let currentUser = localStorage.getItem('username') || null;
    let currentEventId = null;
    let authToken = localStorage.getItem('authToken') || '';
    let eventModal;
    
    // DOM Elements
    const navLinks = document.querySelectorAll('.nav-link, .nav-link-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const eventForm = document.getElementById('event-form');
    const logoutBtn = document.getElementById('logout-btn');
    const usernameDisplay = document.getElementById('username-display');
    const authButtons = document.querySelector('.auth-buttons');
    const registerResult = document.getElementById('register-result');
    const loginResult = document.getElementById('login-result');
    const eventResult = document.getElementById('event-result');
    const registerEventResult = document.getElementById('register-event-result');
    const registerEventBtn = document.getElementById('register-event-btn');
    const unregisterEventBtn = document.getElementById('unregister-event-btn');
    
    // Initialize Bootstrap components
    eventModal = new bootstrap.Modal(document.getElementById('event-detail-modal'));

    // Set up password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            
            // Toggle the type attribute
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.querySelector('i').classList.remove('bi-eye');
                this.querySelector('i').classList.add('bi-eye-slash');
                this.title = 'Hide password';
            } else {
                passwordInput.type = 'password';
                this.querySelector('i').classList.remove('bi-eye-slash');
                this.querySelector('i').classList.add('bi-eye');
                this.title = 'Show password';
            }
        });
    });
    
    // Set minimum date for event creation
    const startDateInput = document.getElementById('event-startDate');
    if (startDateInput) {
        // Set min attribute to current date and time
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        startDateInput.setAttribute('min', minDateTime);
        
        // Add event listener for input validation
        startDateInput.addEventListener('input', function() {
            const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
            if (!datePattern.test(this.value)) {
                this.setCustomValidity('Please enter a valid date in the format YYYY-MM-DDTHH:MM');
            } else {
                const selectedDate = new Date(this.value);
                const now = new Date();
                
                if (selectedDate < now) {
                    this.setCustomValidity('Event date must be in the future');
                } else {
                    this.setCustomValidity('');
                }
            }
        });
    }
    
    // Check if user is logged in
    if (authToken) {
        fetch('/api/auth/login', {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + authToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include'
        })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                // Clear invalid token
                localStorage.removeItem('authToken');
                localStorage.removeItem('username');
                authToken = '';
                currentUser = null;
                throw new Error('Invalid credentials');
            }
        })
        .then(data => {
            // Extract username from token or use stored username
            currentUser = localStorage.getItem('username');
            if (!currentUser && authToken) {
                const credentials = atob(authToken).split(':');
                currentUser = credentials[0];
                localStorage.setItem('username', currentUser);
            }
            
            usernameDisplay.textContent = 'Hello, ' + currentUser;
            if (authButtons) authButtons.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            
            // Load events after successful login
            loadEvents();
        })
        .catch(error => {
            console.error('Login error:', error);
            updateAuthUI(false);
        });
    } else {
        updateAuthUI(false);
    }
    
    // Update authentication UI based on login status
    function updateAuthUI(isLoggedIn) {
        if (isLoggedIn) {
            usernameDisplay.textContent = 'Hello, ' + currentUser;
            if (authButtons) authButtons.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
        } else {
            usernameDisplay.textContent = 'Not logged in';
            if (authButtons) authButtons.style.display = 'flex';
            logoutBtn.style.display = 'none';
        }
    }
    
    // Tab navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            if (!tabId) return;
            
            // Update navigation active states
            navLinks.forEach(nav => {
                if (nav.classList.contains('nav-link')) {
                    nav.classList.remove('active');
                }
            });
            
            // Find and activate the corresponding nav-link
            document.querySelectorAll(`.nav-link[data-tab="${tabId}"]`).forEach(navLink => {
                navLink.classList.add('active');
            });
            
            // Hide all tab panes
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Show the selected tab pane
            document.getElementById(tabId).classList.add('active');
            
            // Load content based on tab
            if (tabId === 'events') {
                loadEvents();
            } else if (tabId === 'my-registrations') {
                if (currentUser) {
                    loadRegistrations();
                }
            }
        });
    });
    
    // Event search functionality - searches only by event name/title
    const eventSearch = document.getElementById('event-search');
    if (eventSearch) {
        eventSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            if (searchTerm === '') {
                // Reset filter to show all events
                document.querySelector('[data-filter="all"]').click();
                return;
            }
            
            const eventCards = document.querySelectorAll('.event-card');
            eventCards.forEach(card => {
                // Only check the title/name of the event
                const title = card.querySelector('.card-title').textContent.toLowerCase();
                
                // Strip any "Registered" badge text from the title for comparison
                const cleanTitle = title.replace('registered', '').trim();
                
                // Find the closest parent element that could be controlling visibility
                const parentCol = card.closest('.col, .col-md-6, .col-lg-4');
                
                if (cleanTitle.includes(searchTerm)) {
                    if (parentCol) {
                        parentCol.style.display = '';
                    } else {
                        card.style.display = ''; // If no parent found, show the card directly
                    }
                } else {
                    if (parentCol) {
                        parentCol.style.display = 'none';
                    } else {
                        card.style.display = 'none'; // If no parent found, hide the card directly
                    }
                }
            });
        });
    }

    // Fix the event filter functionality
    const eventFilters = document.querySelectorAll('[data-filter]');
    eventFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter');
            
            // Update active filter
            eventFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            
            if (filterType === 'all') {
                document.querySelectorAll('.col-md-6.col-lg-4').forEach(card => {
                    card.style.display = '';
                });
                return;
            }
            
            const now = new Date();
            const oneWeekFromNow = new Date();
            oneWeekFromNow.setDate(now.getDate() + 7);
            
            const oneMonthFromNow = new Date();
            oneMonthFromNow.setMonth(now.getMonth() + 1);
            
            document.querySelectorAll('.event-card').forEach(card => {
                const dateStr = card.getAttribute('data-date');
                if (!dateStr) return;
                
                const eventDate = new Date(dateStr);
                const cardCol = card.closest('.col-md-6.col-lg-4');
                
                if (filterType === 'this-week' && eventDate <= oneWeekFromNow && eventDate >= now) {
                    cardCol.style.display = '';
                } else if (filterType === 'this-month' && eventDate <= oneMonthFromNow && eventDate >= now) {
                    cardCol.style.display = '';
                } else if (filterType !== 'all') {
                    cardCol.style.display = 'none';
                }
            });
        });
    });
    
    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const role = document.getElementById('reg-role').value;
            
            const registerData = {
                username: username,
                email: email,
                password: password,
                role: role
            };
            
            showLoading(registerResult);
            
            fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',
                body: JSON.stringify(registerData)
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.text().then(text => {
                        throw new Error(text || 'Registration failed');
                    });
                }
            })
            .then(data => {
                showAlert(registerResult, 'success', 'Registration successful! Please login.');
                registerForm.reset();
                
                // Automatically switch to login tab after successful registration
                setTimeout(() => {
                    document.querySelector('[data-tab="login"]').click();
                }, 1500);
            })
            .catch(error => {
                showAlert(registerResult, 'danger', 'Registration failed: ' + error.message);
            });
        });
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            // Create base64 auth token
            const token = btoa(username + ':' + password);
            
            showLoading(loginResult);
            
            fetch('/api/auth/login', {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + token,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            })
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    throw new Error('Invalid credentials');
                }
            })
            .then(data => {
                localStorage.setItem('authToken', token);
                localStorage.setItem('username', username);
                authToken = token;
                currentUser = username;
                
                showAlert(loginResult, 'success', 'Login successful!');
                updateAuthUI(true);
                
                loginForm.reset();
                
                // Switch to events tab after successful login
                setTimeout(() => {
                    document.querySelector('[data-tab="events"]').click();
                }, 1000);
            })
            .catch(error => {
                showAlert(loginResult, 'danger', 'Login failed: ' + error.message);
            });
        });
    }
    
    // Create event form submission
    if (eventForm) {
        eventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!authToken) {
                showAlert(eventResult, 'danger', 'Please login to create an event.');
                return;
            }
            
            const title = document.getElementById('event-title').value;
            const description = document.getElementById('event-description').value;
            const startDateStr = document.getElementById('event-startDate').value;
            const location = document.getElementById('event-location').value;
            const imageInput = document.getElementById('event-image');
            
            // Validate the date
            const startDate = new Date(startDateStr);
            const now = new Date();
            
            if (isNaN(startDate.getTime())) {
                showAlert(eventResult, 'danger', 'Please enter a valid date and time.');
                return;
            }
            
            if (startDate < now) {
                showAlert(eventResult, 'danger', 'Event date must be in the future.');
                return;
            }
            
            // Create the basic event data
            const eventData = {
                title: title,
                description: description,
                startDate: startDateStr,
                location: location,
                imageBase64: null // Default to null if no image
            };
            
            // If a file is selected, process it
            if (imageInput.files && imageInput.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(fileEvent) {
                    // Get the base64 data (remove the prefix like "data:image/jpeg;base64,")
                    const base64Data = fileEvent.target.result.split(',')[1];
                    eventData.imageBase64 = base64Data;
                    
                    // Now submit with the image
                    submitEventData(eventData);
                };
                
                reader.readAsDataURL(imageInput.files[0]);
            } else {
                // Submit without image
                submitEventData(eventData);
            }
        });
    }

    // Function to submit event data (extracted to avoid duplicate code)
    function submitEventData(eventData) {
        showLoading(eventResult);
        
        fetch('/api/events/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + authToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include',
            body: JSON.stringify(eventData)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => {
                    throw new Error(text || 'Failed to create event');
                });
            }
        })
        .then(data => {
            showAlert(eventResult, 'success', 'Event created successfully!');
            eventForm.reset();
            
            // Reload events and switch to events tab
            setTimeout(() => {
                loadEvents();
                document.querySelector('[data-tab="events"]').click();
            }, 1500);
        })
        .catch(error => {
            showAlert(eventResult, 'danger', 'Failed to create event: ' + error.message);
        });
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            authToken = '';
            currentUser = null;
            updateAuthUI(false);
            
            // Clear registration list
            const registrationsList = document.getElementById('registrations-list');
            if (registrationsList) {
                registrationsList.innerHTML = '<div class="col-12"><div class="card"><div class="card-body text-center"><p class="mb-0">Login to view your registrations.</p></div></div></div>';
            }
            
            // Switch to home tab
            document.querySelector('[data-tab="home"]').click();
        });
    }
    
    // Function to load events
    function loadEvents() {
        const eventsContainer = document.getElementById('events-list');
        if (!eventsContainer) return;
        
        eventsContainer.innerHTML = `
            <div class="col-12">
                <div class="d-flex justify-content-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        `;
        
        const headers = {
            'X-Requested-With': 'XMLHttpRequest'
        };
        
        if (authToken) {
            headers['Authorization'] = 'Basic ' + authToken;
        }
        
        fetch('/api/events/all', {
            method: 'GET',
            headers: headers,
            credentials: 'include'
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 401) {
                eventsContainer.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-warning text-center">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            Please login to view events.
                        </div>
                    </div>
                `;
                throw new Error('Authentication required');
            } else {
                throw new Error('Failed to load events');
            }
        })
        .then(events => {
            if (events.length === 0) {
                eventsContainer.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-info text-center">
                            <i class="bi bi-info-circle me-2"></i>
                            No events found.
                        </div>
                    </div>
                `;
                return;
            }
            
            eventsContainer.innerHTML = '';
            events.forEach(event => {
                // Format the date for display
                const formattedDate = formatDate(event.startDate);
                
                // Create registration badge if user is registered
                let registrationBadge = '';
                if (event.isRegistered) {
                    registrationBadge = '<span class="registered-badge"><i class="bi bi-check2 me-1"></i>Registered</span>';
                }
                
                const eventCard = document.createElement('div');
                eventCard.className = 'col-md-6 col-lg-4';
                eventCard.innerHTML = `
                    <div class="card event-card h-100" data-date="${event.startDate}">
                        <div class="card-body">
                            <h5 class="card-title">${event.title} ${registrationBadge}</h5>
                            <p class="event-date"><i class="bi bi-calendar3 me-2"></i>${formattedDate}</p>
                            <p class="event-location"><i class="bi bi-geo-alt me-2"></i>${event.location}</p>
                            <p class="card-text">${event.description}</p>
                        </div>
                        <div class="card-footer bg-white border-top-0">
                            <button class="btn btn-sm btn-outline-primary view-details-btn">
                                <i class="bi bi-info-circle me-1"></i>View Details
                            </button>
                        </div>
                    </div>
                `;
                
                const viewDetailsBtn = eventCard.querySelector('.view-details-btn');
                viewDetailsBtn.addEventListener('click', () => showEventDetails(event));
                
                eventCard.querySelector('.event-card').addEventListener('click', () => showEventDetails(event));
                eventsContainer.appendChild(eventCard);
            });
            
            // Initialize event filters
            document.querySelector('[data-filter="all"]').click();
        })
        .catch(error => {
            console.error('Error loading events:', error);
        });
    }
    
    // Load user registrations
    function loadRegistrations() {
        const registrationsContainer = document.getElementById('registrations-list');
        if (!registrationsContainer) return;
        
        if (!authToken) {
            registrationsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning text-center">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        Please login to view your registrations.
                    </div>
                </div>
            `;
            return;
        }
        
        registrationsContainer.innerHTML = `
            <div class="col-12">
                <div class="d-flex justify-content-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        `;
        
        fetch('/api/registrations/my-registrations', {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + authToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include'
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to load registrations');
            }
        })
        .then(registrations => {
            if (registrations.length === 0) {
                registrationsContainer.innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-info text-center">
                            <i class="bi bi-info-circle me-2"></i>
                            You have not registered for any events.
                        </div>
                    </div>
                `;
                return;
            }
            
            registrationsContainer.innerHTML = '';
            registrations.forEach(reg => {
                const eventDate = formatDate(reg.event.startDate);
                const regDate = formatDate(reg.registrationDate);
                
                const regCard = document.createElement('div');
                regCard.className = 'col-md-6';
                regCard.innerHTML = `
                    <div class="card mb-4">
                        <div class="card-header bg-primary text-white">
                            <h5 class="card-title mb-0">${reg.event.title}</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <p><i class="bi bi-calendar3 me-2"></i><strong>Event Date:</strong> ${eventDate}</p>
                                    <p><i class="bi bi-geo-alt me-2"></i><strong>Location:</strong> ${reg.event.location}</p>
                                    <p><i class="bi bi-clock-history me-2"></i><strong>Registered on:</strong> ${regDate}</p>
                                </div>
                                <div class="col-md-4 text-center">
                                    <div class="qr-code-container">
                                        <img src="data:image/png;base64,${reg.qrCodeBase64}" alt="QR Code" class="img-fluid">
                                    </div>
                                    <p class="text-muted small">Scan for verification</p>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-sm btn-outline-primary view-ticket-btn" data-reg-id="${reg.id}">
                                <i class="bi bi-ticket-perforated me-1"></i>View Ticket
                            </button>
                            <button class="btn btn-sm btn-outline-secondary print-ticket-btn">
                                <i class="bi bi-printer me-1"></i>Print
                            </button>
                        </div>
                    </div>
                `;
                
                // Add print functionality
                const printBtn = regCard.querySelector('.print-ticket-btn');
                printBtn.addEventListener('click', function() {
                    const ticketWindow = window.open('', '_blank');
                    ticketWindow.document.write(`
                        <html>
                        <head>
                            <title>Event Ticket - ${reg.event.title}</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                                .ticket { border: 1px solid #ddd; padding: 20px; max-width: 600px; margin: 0 auto; }
                                .ticket-header { border-bottom: 2px solid #4361ee; padding-bottom: 10px; margin-bottom: 20px; }
                                .ticket-content { margin-bottom: 20px; }
                                .ticket-footer { border-top: 1px solid #ddd; padding-top: 10px; text-align: center; }
                                .qr-code { text-align: center; margin: 20px 0; }
                                @media print {
                                    body { padding: 0; }
                                    .ticket { border: none; }
                                }
                            </style>
                        </head>
                        <body>
                            <div class="ticket">
                                <div class="ticket-header">
                                    <h1 style="margin: 0; color: #4361ee;">Event Ticket</h1>
                                    <p style="margin: 5px 0 0 0;">EventPulse</p>
                                </div>
                                <div class="ticket-content">
                                    <h2>${reg.event.title}</h2>
                                    <p><strong>Date:</strong> ${eventDate}</p>
                                    <p><strong>Location:</strong> ${reg.event.location}</p>
                                    <p><strong>Attendee:</strong> ${currentUser}</p>
                                </div>
                                <div class="qr-code">
                                    <img src="data:image/png;base64,${reg.qrCodeBase64}" alt="QR Code" style="max-width: 200px;">
                                </div>
                                <div class="ticket-footer">
                                    <p style="margin: 0;">Ticket ID: ${reg.id}</p>
                                    <p style="margin: 5px 0 0 0; font-size: 0.8em;">Registered on: ${regDate}</p>
                                </div>
                            </div>
                            <script>
                                window.onload = function() { window.print(); }
                            </script>
                        </body>
                        </html>
                    `);
                    ticketWindow.document.close();
                });
                
                registrationsContainer.appendChild(regCard);
            });
        })
        .catch(error => {
            registrationsContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger text-center">
                        <i class="bi bi-exclamation-circle me-2"></i>
                        Error loading registrations: ${error.message}
                    </div>
                </div>
            `;
            console.error('Error loading registrations:', error);
        });
    }
    
    // Show event details in modal
    function showEventDetails(event) {
        document.getElementById('modal-event-title').textContent = event.title;
        document.getElementById('modal-event-description').textContent = event.description;
        document.getElementById('modal-event-date').textContent = formatDate(event.startDate);
        document.getElementById('modal-event-location').textContent = event.location;
        
        // Set button state based on registration status
        if (event.isRegistered) {
            registerEventBtn.style.display = 'none';
            unregisterEventBtn.style.display = 'block';
            showAlert(registerEventResult, 'success', 'You are registered for this event.');
        } else {
            registerEventBtn.style.display = 'block';
            unregisterEventBtn.style.display = 'none';
            registerEventResult.style.display = 'none';
        }
        
        currentEventId = event.id;
        eventModal.show();
    }
    
    // Register for event
    if (registerEventBtn) {
        registerEventBtn.addEventListener('click', function() {
            if (!authToken) {
                showAlert(registerEventResult, 'danger', 'Please login to register for events.');
                return;
            }
            
            // Don't allow registration if button is disabled (already registered)
            if (registerEventBtn.disabled) {
                return;
            }
            
            showLoading(registerEventResult);
            
            fetch(`/api/registrations/register/${currentEventId}`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + authToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.text().then(text => {
                        throw new Error(text || 'Failed to register for event');
                    });
                }
            })
            .then(data => {
                showAlert(registerEventResult, 'success', 'Registration successful!');
                
                // Update button state
                registerEventBtn.disabled = true;
                registerEventBtn.innerHTML = '<i class="bi bi-check2-circle me-2"></i>Already Registered';
                
                // Refresh events list
                loadEvents();
            })
            .catch(error => {
                showAlert(registerEventResult, 'danger', 'Registration failed: ' + error.message);
            });
        });
    }

    // Unregister for event
    if (unregisterEventBtn) {
        unregisterEventBtn.addEventListener('click', function() {
            if (!authToken) {
                showAlert(registerEventResult, 'danger', 'Please login to unregister from events.');
                return;
            }
            
            // Confirm before unregistering
            if (!confirm('Are you sure you want to unregister from this event?')) {
                return;
            }
            
            showLoading(registerEventResult);
            
            fetch(`/api/registrations/unregister/${currentEventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Basic ' + authToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            })
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    return response.text().then(text => {
                        throw new Error(text || 'Failed to unregister from event');
                    });
                }
            })
            .then(data => {
                showAlert(registerEventResult, 'success', 'Successfully unregistered from event.');
                
                // Update button state
                registerEventBtn.style.display = 'block';
                unregisterEventBtn.style.display = 'none';
                
                // Refresh events list
                loadEvents();
                
                // Also refresh registrations if we're on that tab
                if (document.getElementById('my-registrations').classList.contains('active')) {
                    loadRegistrations();
                }
            })
            .catch(error => {
                showAlert(registerEventResult, 'danger', 'Unregistration failed: ' + error.message);
            });
        });
    }
    
    // Utility function to format dates
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Utility function to show alerts
    function showAlert(element, type, message) {
        if (!element) return;
        
        element.className = `alert alert-${type}`;
        element.innerHTML = message;
        element.style.display = 'block';
        
        // Automatically hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    }
    
    // Utility function to show loading state
    function showLoading(element) {
        if (!element) return;
        
        element.className = 'alert alert-info';
        element.innerHTML = '<div class="d-flex align-items-center"><div class="spinner-border spinner-border-sm me-2" role="status"></div>Processing...</div>';
        element.style.display = 'block';
    }
    
    // Initialize the app by loading the appropriate content
    // If user is logged in, load events
    if (authToken) {
        // Wait a bit for the UI to be ready
        setTimeout(() => {
            loadEvents();
        }, 100);
    }
    
    // Setup modal close handler for the event detail modal
    document.getElementById('event-detail-modal')?.addEventListener('hidden.bs.modal', function () {
        // Reset the registration result message when modal is closed
        if (registerEventResult) {
            registerEventResult.style.display = 'none';
        }
    });
    
    // Make the first tab active initially
    document.querySelector('.nav-link.active')?.click();
});