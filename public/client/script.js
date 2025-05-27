document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop();
    if (page.includes('appointments.html')) {
        fetchAppointments();
        updateStats();
    } else if (page.includes('add-new.html')) {
        fetchPatients();
        handleEditAppointment();
    } else if (page.includes('reminders.html')) {
        fetchReminders();
    } else if (page.includes('reports.html')) {
        updateReports();
    }
    updateNotificationCount();
    setupEventListeners();
});

function setupEventListeners() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebar = document.getElementById('sidebar');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            mobileMenuToggle.style.display = sidebar.classList.contains('active') ? 'none' : 'block';
        });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', () => {
            sidebar.classList.remove('active');
            mobileMenuToggle.style.display = 'block';
        });
    }

    const page = window.location.pathname.split('/').pop();
    if (page.includes('appointments.html')) {
        document.getElementById('searchInput')?.addEventListener('input', debounce(filterAppointments, 300));
        document.getElementById('statusFilter')?.addEventListener('change', filterAppointments);
        document.getElementById('appointmentsBody')?.addEventListener('click', handleAppointmentActions);
    } else if (page.includes('add-new.html')) {
        document.getElementById('appointmentForm')?.addEventListener('submit', handleAppointmentSubmit);
        document.getElementById('patientForm')?.addEventListener('submit', handlePatientSubmit);
    } else if (page.includes('reminders.html')) {
        document.getElementById('remindersBody')?.addEventListener('click', handleReminderActions);
    } else if (page.includes('reports.html')) {
        document.getElementById('reportPeriod')?.addEventListener('change', updateReports);
        document.getElementById('exportCsvBtn')?.addEventListener('click', exportToCsv);
    }

    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    document.getElementById('appointmentModal')?.addEventListener('click', e => {
        if (e.target === document.getElementById('appointmentModal')) closeModal();
    });
    document.getElementById('sendReminderBtn')?.addEventListener('click', () => {
        const id = document.querySelector('.appointment-details')?.dataset.id;
        if (id) sendReminder(id);
    });
    document.getElementById('editAppointmentBtn')?.addEventListener('click', () => {
        const id = document.querySelector('.appointment-details')?.dataset.id;
        if (id) editAppointment(id);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
            mobileMenuToggle.style.display = 'none';
        } else {
            mobileMenuToggle.style.display = sidebar.classList.contains('active') ? 'none' : 'block';
        }
    });
}

async function fetchPatients() {
    try {
        const response = await fetch('http://localhost:3000/api/patients');
        const patients = await response.json();
        const patientSelect = document.getElementById('patientId');
        if (patientSelect) {
            patientSelect.innerHTML = '<option value="">Select Patient</option>';
            patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = `${patient.name} (${patient.phone})`;
                patientSelect.appendChild(option);
            });
        }
    } catch (error) {
        showNotification('Error loading patients', 'error');
    }
}

async function fetchAppointments() {
    try {
        const response = await fetch('http://localhost:3000/api/appointments');
        const appointments = await response.json();
        renderAppointments(appointments);
    } catch (error) {
        showNotification('Error loading appointments', 'error');
    }
}

function renderAppointments(appointments) {
    const tbody = document.getElementById('appointmentsBody');
    if (tbody) {
        tbody.innerHTML = '';
        appointments.forEach(appointment => {
            const row = document.createElement('tr');
            row.dataset.id = appointment.id;
            row.innerHTML = `
                <td>${appointment.name}</td>
                <td>${appointment.phone}</td>
                <td>${appointment.time}</td>
                <td>${appointment.type}</td>
                <td><span class="status-badge status-${appointment.status}">${appointment.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-view"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon btn-edit"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon btn-delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

async function filterAppointments() {
    const search = document.getElementById('searchInput')?.value.toLowerCase();
    const status = document.getElementById('statusFilter')?.value;
    try {
        const response = await fetch(`http://localhost:3000/api/appointments?search=${encodeURIComponent(search)}&status=${status}`);
        const appointments = await response.json();
        renderAppointments(appointments);
    } catch (error) {
        showNotification('Error filtering appointments', 'error');
    }
}

async function handleAppointmentSubmit(e) {
    e.preventDefault();
    const data = {
        patientId: document.getElementById('patientId').value,
        date: document.getElementById('appointmentDate').value,
        time: formatTime(document.getElementById('appointmentTime').value),
        type: document.getElementById('appointmentType').value,
        reminderType: document.getElementById('reminderType').value
    };
    try {
        const form = document.getElementById('appointmentForm');
        const endpoint = form.dataset.editId ? `/api/appointments/${form.dataset.editId}` : '/api/appointments';
        const method = form.dataset.editId ? 'PUT' : 'POST';
        await fetch(`http://localhost:3000${endpoint}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        showNotification(`Appointment ${method === 'PUT' ? 'updated' : 'added'}`, 'success');
        form.reset();
        delete form.dataset.editId;
        window.location.href = 'appointments.html';
    } catch (error) {
        showNotification('Error saving appointment', 'error');
    }
}

async function handlePatientSubmit(e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('patientName').value,
        phone: document.getElementById('patientPhone').value,
        email: document.getElementById('patientEmail').value
    };
    try {
        await fetch('http://localhost:3000/api/patients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        showNotification('Patient added', 'success');
        document.getElementById('patientForm').reset();
        fetchPatients();
    } catch (error) {
        showNotification('Error adding patient', 'error');
    }
}

function handleAppointmentActions(e) {
    const btn = e.target.closest('.btn-icon');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;
    if (btn.classList.contains('btn-view')) showAppointmentModal(id);
    else if (btn.classList.contains('btn-edit')) editAppointment(id);
    else if (btn.classList.contains('btn-delete')) deleteAppointment(id);
}

async function showAppointmentModal(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/appointments/${id}`);
        const appointment = await response.json();
        document.getElementById('modalBody').innerHTML = `
            <div class="appointment-details" data-id="${appointment.id}">
                <p><strong>Name:</strong> ${appointment.name}</p>
                <p><strong>Phone:</strong> ${appointment.phone}</p>
                <p><strong>Email:</strong> ${appointment.email || 'N/A'}</p>
                <p><strong>Date:</strong> ${appointment.date}</p>
                <p><strong>Time:</strong> ${appointment.time}</p>
                <p><strong>Type:</strong> ${appointment.type}</p>
                <p><strong>Status:</strong> ${appointment.status}</p>
                <p><strong>Reminder:</strong> ${appointment.reminderType || 'None'}</p>
            </div>
        `;
        document.getElementById('appointmentModal').style.display = 'flex';
    } catch (error) {
        showNotification('Error loading appointment', 'error');
    }
}

async function editAppointment(id) {
    window.location.href = `add-new.html?editId=${id}`;
}

async function deleteAppointment(id) {
    if (confirm('Delete this appointment?')) {
        try {
            await fetch(`http://localhost:3000/api/appointments/${id}`, { method: 'DELETE' });
            showNotification('Appointment deleted', 'success');
            fetchAppointments();
        } catch (error) {
            showNotification('Error deleting appointment', 'error');
        }
    }
}

async function fetchReminders() {
    try {
        const response = await fetch('http://localhost:3000/api/reminders');
        const reminders = await response.json();
        const tbody = document.getElementById('remindersBody');
        if (tbody) {
            tbody.innerHTML = '';
            reminders.forEach(reminder => {
                const row = document.createElement('tr');
                row.dataset.id = reminder.id;
                row.innerHTML = `
                    <td>${reminder.name}</td>
                    <td>${reminder.date}</td>
                    <td>${reminder.time}</td>
                    <td>${reminder.reminderType}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-send"><i class="fas fa-bell"></i></button>
                            <button class="btn-icon btn-delete"><i class="fas fa-times"></i></button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        showNotification('Error loading reminders', 'error');
    }
}

function handleReminderActions(e) {
    const btn = e.target.closest('.btn-icon');
    if (!btn) return;
    const id = btn.closest('tr').dataset.id;
    if (btn.classList.contains('btn-send')) sendReminder(id);
    else if (btn.classList.contains('btn-delete')) cancelReminder(id);
}

async function sendReminder(id) {
    try {
        await fetch(`http://localhost:3000/api/reminders/send/${id}`, { method: 'POST' });
        showNotification('Reminder sent', 'success');
        closeModal();
    } catch (error) {
        showNotification('Error sending reminder', 'error');
    }
}

async function cancelReminder(id) {
    try {
        await fetch(`http://localhost:3000/api/reminders/${id}`, { method: 'DELETE' });
        showNotification('Reminder cancelled', 'success');
        fetchReminders();
    } catch (error) {
        showNotification('Error cancelling reminder', 'error');
    }
}

async function updateStats() {
    try {
        const response = await fetch('http://localhost:3000/api/appointments');
        const appointments = await response.json();
        document.getElementById('totalAppointments').textContent = appointments.length;
        document.getElementById('confirmedAppointments').textContent = appointments.filter(a => a.status === 'confirmed').length;
        document.getElementById('pendingAppointments').textContent = appointments.filter(a => a.status === 'pending').length;
        document.getElementById('cancelledAppointments').textContent = appointments.filter(a => a.status === 'cancelled').length;
    } catch (error) {
        showNotification('Error updating stats', 'error');
    }
}

async function updateReports() {
    const period = document.getElementById('reportPeriod')?.value;
    if (!period) return;
    try {
        const response = await fetch(`http://localhost:3000/api/reports?period=${period}`);
        const data = await response.json();
        document.getElementById('totalAppointmentsReport').textContent = data.totalAppointments;
        document.getElementById('completedAppointmentsReport').textContent = data.completedAppointments;
        document.getElementById('noShowsReport').textContent = data.noShows;
        document.getElementById('checkupPercentage').textContent = `${data.checkupPercentage}%`;
        document.getElementById('consultationPercentage').textContent = `${data.consultationPercentage}%`;
        document.getElementById('followUpPercentage').textContent = `${data.followUpPercentage}%`;
        document.getElementById('emergencyPercentage').textContent = `${data.emergencyPercentage}%`;
    } catch (error) {
        showNotification('Error updating reports', 'error');
    }
}

async function exportToCsv() {
    const period = document.getElementById('reportPeriod')?.value;
    if (!period) return;
    try {
        const response = await fetch(`http://localhost:3000/api/export?period=${period}`);
        const csv = await response.text();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `appointments_${period}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Report exported', 'success');
    } catch (error) {
        showNotification('Error exporting report', 'error');
    }
}

async function updateNotificationCount() {
    try {
        const response = await fetch('http://localhost:3000/api/reminders');
        const reminders = await response.json();
        document.getElementById('notificationCount').textContent = reminders.length;
    } catch (error) {}
}

function formatTime(time24h) {
    if (!time24h) return '';
    const [hours, minutes] = time24h.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
}

function closeModal() {
    document.getElementById('appointmentModal').style.display = 'none';
}

function showNotification(message, type) {
    const div = document.createElement('div');
    div.className = `notification notification-${type}`;
    div.textContent = message;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function handleEditAppointment() {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('editId');
    if (editId) {
        fetch(`http://localhost:3000/api/appointments/${editId}`)
            .then(response => response.json())
            .then(appointment => {
                document.getElementById('patientId').value = appointment.patientId;
                document.getElementById('appointmentDate').value = appointment.date;
                document.getElementById('appointmentTime').value = appointment.time.split(' ')[0];
                document.getElementById('appointmentType').value = appointment.type;
                document.getElementById('reminderType').value = appointment.reminderType || 'none';
                document.getElementById('appointmentForm').dataset.editId = editId;
            })
            .catch(() => showNotification('Error loading appointment', 'error'));
    }
}
async function handlePatientSubmit(e) {
    e.preventDefault();
    try {
        await db.collection('patients').add({
            name: document.getElementById('patientName').value,
            phone: document.getElementById('patientPhone').value,
            email: document.getElementById('patientEmail').value
        });
        showNotification('Patient added', 'success');
        document.getElementById('patientForm').reset();
        fetchPatients();
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error adding patient', 'error');
    }
}