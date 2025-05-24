// Sample data for appointments
let appointments = [
    {
        id: 1,
        name: "John Smith",
        phone: "+1 (555) 123-4567",
        time: "09:00 AM",
        type: "checkup",
        status: "confirmed",
        email: "john.smith@email.com"
    },
    {
        id: 2,
        name: "Sarah Johnson",
        phone: "+1 (555) 234-5678",
        time: "10:30 AM",
        type: "consultation",
        status: "pending",
        email: "sarah.j@email.com"
    },
    {
        id: 3,
        name: "Mike Davis",
        phone: "+1 (555) 345-6789",
        time: "11:15 AM",
        type: "follow-up",
        status: "confirmed",
        email: "mike.davis@email.com"
    },
    {
        id: 4,
        name: "Emily Brown",
        phone: "+1 (555) 456-7890",
        time: "02:00 PM",
        type: "emergency",
        status: "confirmed",
        email: "emily.brown@email.com"
    },
    {
        id: 5,
        name: "David Wilson",
        phone: "+1 (555) 567-8901",
        time: "03:30 PM",
        type: "checkup",
        status: "cancelled",
        email: "david.w@email.com"
    }
];

// DOM Elements
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const sidebar = document.getElementById('sidebar');
const sidebarClose = document.getElementById('sidebarClose');
const menuItems = document.querySelectorAll('.menu-item');
const contentSections = document.querySelectorAll('.content-section');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const appointmentsTable = document.getElementById('appointmentsTable');
const appointmentForm = document.getElementById('appointmentForm');
const modal = document.getElementById('appointmentModal');
const modalClose = document.getElementById('modalClose');
const addPatientBtn = document.getElementById('addPatientBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderAppointments();
    setupEventListeners();
    updateStats();
    
    // Add fade-in animation to content
    document.querySelector('.main-content').classList.add('fade-in');
});

// Setup all event listeners
function setupEventListeners() {
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', toggleSidebar);
    sidebarClose.addEventListener('click', closeSidebar);
    
    // Sidebar navigation
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
            setActiveMenuItem(item);
            
            // Close sidebar on mobile after selection
            if (window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    });
    
    // Search and filter
    searchInput.addEventListener('input', filterAppointments);
    statusFilter.addEventListener('change', filterAppointments);
    
    // Form submission
    appointmentForm.addEventListener('submit', handleFormSubmit);
    
    // Modal controls
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Add patient button
    addPatientBtn.addEventListener('click', () => {
        switchSection('add-new');
        setActiveMenuItem(document.querySelector('[data-section="add-new"]'));
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !mobileMenuToggle.contains(e.target) &&
            sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
        }
    });
}

// Sidebar functions
function toggleSidebar() {
    sidebar.classList.toggle('active');
}

function closeSidebar() {
    sidebar.classList.remove('active');
}

// Navigation functions
function switchSection(sectionName) {
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.classList.add('fade-in');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            targetSection.classList.remove('fade-in');
        }, 500);
    }
}

function setActiveMenuItem(activeItem) {
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    activeItem.classList.add('active');
}

// Appointment rendering functions
function renderAppointments(appointmentsToRender = appointments) {
    const tbody = document.getElementById('appointmentsBody');
    tbody.innerHTML = '';
    
    appointmentsToRender.forEach(appointment => {
        const row = createAppointmentRow(appointment);
        tbody.appendChild(row);
    });
}

function createAppointmentRow(appointment) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><strong>${appointment.name}</strong></td>
        <td>${appointment.phone}</td>
        <td>${appointment.time}</td>
        <td>${getTypeDisplay(appointment.type)}</td>
        <td><span class="status-badge status-${appointment.status}">${getStatusDisplay(appointment.status)}</span></td>
        <td>
            <div class="action-buttons">
                <button class="btn-icon btn-view" onclick="viewAppointment(${appointment.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon btn-edit" onclick="editAppointment(${appointment.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteAppointment(${appointment.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    return row;
}

function getTypeDisplay(type) {
    const types = {
        'checkup': '🔍 Checkup',
        'consultation': '💬 Consultation',
        'follow-up': '🔄 Follow-up',
        'emergency': '🚨 Emergency'
    };
    return types[type] || type;
}

function getStatusDisplay(status) {
    const statuses = {
        'confirmed': '✅ Confirmed',
        'pending': '⏳ Pending',
        'cancelled': '❌ Cancelled'
    };
    return statuses[status] || status;
}

// Filter and search functions
function filterAppointments() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    
    const filtered = appointments.filter(appointment => {
        const matchesSearch = appointment.name.toLowerCase().includes(searchTerm) ||
                            appointment.phone.includes(searchTerm);
        const matchesStatus = !statusValue || appointment.status === statusValue;
        
        return matchesSearch && matchesStatus;
    });
    
    renderAppointments(filtered);
}

// Appointment actions
function viewAppointment(id) {
    const appointment = appointments.find(apt => apt.id === id);
    if (appointment) {
        showAppointmentModal(appointment);
    }
}

function editAppointment(id) {
    const appointment = appointments.find(apt => apt.id === id);
    if (appointment) {
        // Switch to add new section and populate form
        switchSection('add-new');
        setActiveMenuItem(document.querySelector('[data-section="add-new"]'));
        populateForm(appointment);
    }
}

function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment? 🗑️')) {
        appointments = appointments.filter(apt => apt.id !== id);
        renderAppointments();
        updateStats();
        showNotification('Appointment deleted successfully! ✅', 'success');
    }
}

function populateForm(appointment) {
    document.getElementById('patientName').value = appointment.name;
    document.getElementById('patientPhone').value = appointment.phone;
    document.getElementById('appointmentType').value = appointment.type;
    document.getElementById('patientEmail').value = appointment.email || '';
    
    // Set today's date and the appointment time
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').value = today;
    
    // Convert time format if needed
    const timeValue = convertTo24Hour(appointment.time);
    document.getElementById('appointmentTime').value = timeValue;
}

function convertTo24Hour(time12h) {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
        hours = '00';
    }
    if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// Modal functions
function showAppointmentModal(appointment) {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="appointment-details">
            <h4>👤 Patient Information</h4>
            <p><strong>Name:</strong> ${appointment.name}</p>
            <p><strong>Phone:</strong> ${appointment.phone}</p>
            <p><strong>Email:</strong> ${appointment.email || 'Not provided'}</p>
            
            <h4 style="margin-top: 20px;">📅 Appointment Details</h4>
            <p><strong>Time:</strong> ${appointment.time}</p>
            <p><strong>Type:</strong> ${getTypeDisplay(appointment.type)}</p>
            <p><strong>Status:</strong> ${getStatusDisplay(appointment.status)}</p>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Form handling
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newAppointment = {
        id: Date.now(), // Simple ID generation
        name: document.getElementById('patientName').value,
        phone: document.getElementById('patientPhone').value,
        time: formatTime(document.getElementById('appointmentTime').value),
        type: document.getElementById('appointmentType').value,
        status: 'pending',
        email: document.getElementById('patientEmail').value
    };
    
    appointments.push(newAppointment);
    renderAppointments();
    updateStats();
    
    // Reset form
    e.target.reset();
    
    // Show success message
    showNotification('Appointment added successfully! 🎉', 'success');
    
    // Switch back to appointments view
    setTimeout(() => {
        switchSection('appointments');
        setActiveMenuItem(document.querySelector('[data-section="appointments"]'));
    }, 1500);
}

function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
}

// Statistics update
function updateStats() {
    const total = appointments.length;
    const confirmed = appointments.filter(apt => apt.status === 'confirmed').length;
    const pending = appointments.filter(apt => apt.status === 'pending').length;
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
    
    const statCards = document.querySelectorAll('.stat-card h3');
    if (statCards.length >= 4) {
        statCards[0].textContent = total;
        statCards[1].textContent = confirmed;
        statCards[2].textContent = pending;
        statCards[3].textContent = cancelled;
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : '#0c5460'};
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        z-index: 3000;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
    }
`;
document.head.appendChild(style);

// Additional interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add send reminder functionality
    document.getElementById('sendReminderBtn').addEventListener('click', function() {
        showNotification('Reminder sent successfully! 📲', 'success');
        closeModal();
    });
    
    // Add edit appointment functionality
    document.getElementById('editAppointmentBtn').addEventListener('click', function() {
        closeModal();
        switchSection('add-new');
        setActiveMenuItem(document.querySelector('[data-section="add-new"]'));
        showNotification('Edit mode activated! ✏️', 'info');
    });
    
    // Add toggle functionality for reminder settings
    document.querySelectorAll('.toggle input').forEach(toggle => {
        toggle.addEventListener('change', function() {
            const reminderType = this.closest('.reminder-card').querySelector('h3').textContent;
            const status = this.checked ? 'enabled' : 'disabled';
            showNotification(`${reminderType} ${status}! 🔔`, 'info');
        });
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC key to close modal
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
    
    // Ctrl/Cmd + N to add new appointment
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        switchSection('add-new');
        setActiveMenuItem(document.querySelector('[data-section="add-new"]'));
        document.getElementById('patientName').focus();
    }
});

// Enhanced search with debouncing
let searchTimeout;
searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        filterAppointments();
    }, 300);
});
