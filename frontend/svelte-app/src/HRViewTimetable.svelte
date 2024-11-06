<script>
    import { onMount, onDestroy } from 'svelte';
    
    // Filter states
    let departments = ['Engineering', 'Marketing', 'HR', 'Finance', 'Sales'];
    // Modal state
    let showDetailModal = false;
    let selectedEmployee = null;
    let searchQuery = '';
    let selectedDepartment = '';
    let selectedStatus='';
    let selectedDateRange='';
    let startDate='';
    let endDate=''; 
    // Data and loading states
    let employees = [];
    let loading = true;
    let error = null;
    let isRequestInProgress = false;

    // UI states
    let showFilters = true;
    let activeTab = 'all'; // 'all', 'office', 'remote'

    // API base URL
    const API_BASE_URL = 'http://localhost:5000';

    // Combined filter state
    $: filterState = {
        department: selectedDepartment,
        status: selectedStatus,
        search: searchQuery,
        dateRange: selectedDateRange,
        startDate,
        endDate
    };

    // Derived employee lists
    $: filteredEmployees = employees;
    $: officeEmployees = filteredEmployees.filter(emp => emp.status === 'office');
    $: remoteEmployees = filteredEmployees.filter(emp => emp.status === 'remote');
    $: totalEmployees = filteredEmployees.length;
    $: officePercentage = totalEmployees ? (officeEmployees.length / totalEmployees * 100).toFixed(1) : 0;
    $: remotePercentage = totalEmployees ? (remoteEmployees.length / totalEmployees * 100).toFixed(1) : 0;

    // Fetch employees with improved error handling
    async function fetchEmployees(filters = {}) {
        if (isRequestInProgress) return;


        
        try {
            isRequestInProgress = true;
            const loadingDelay = 300;
            const startTime = Date.now();
            
            const loadingTimeout = setTimeout(() => {
                if (isRequestInProgress) {
                    loading = true;
                }
            }, 150);

            // Build query parameters
            const params = new URLSearchParams();
            if (filters.department !== 'All') params.append('department', filters.department);
            if (filters.status !== 'All') params.append('status', filters.status.toLowerCase());
            if (filters.search) params.append('search', filters.search);

            // Fetch data from backend
            const response = await fetch(`${API_BASE_URL}/employees?${params.toString()}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch employees');
            }

            const data = await response.json();
            employees = data.employees;
            
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime < loadingDelay) {
                await new Promise(resolve => setTimeout(resolve, loadingDelay - elapsedTime));
            }
            
            clearTimeout(loadingTimeout);
            error = null;
            
        } catch (err) {
            console.error('Error fetching employees:', err);
            error = err.message || 'Failed to load employee data';
            employees = [];
        } finally {
            loading = false;
            isRequestInProgress = false;
        }
    }


    // Update employee status
    async function updateEmployeeStatus(employeeId, newStatus) {
        try {
            const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });









            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update status');
            }

            // Reload data with current filters
            await fetchEmployees(filterState);
        } catch (error) {
            console.error('Error updating employee status:', error);




        }
    }

    // Fetch employee schedule
    async function fetchEmployeeSchedule(employeeId) {
        try {
            const params = new URLSearchParams();
            if (selectedDateRange === 'custom') {
                params.append('start_date', startDate);
                params.append('end_date', endDate);




            }

            const response = await fetch(
                `${API_BASE_URL}/employee/${employeeId}/schedule?${params.toString()}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch schedule');
            }

            const data = await response.json();
            return data.schedules;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            return [];
        }
    }

    // Helper functions




    function getStatusColor(status) {
        return status === 'office' ? 'bg-green-100' : 'bg-blue-100';
    }

    function getEmployeeInitials(name) {
        return name.split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    }

    function toggleFilters() {
        showFilters = !showFilters;
    }

    async function openEmployeeDetail(employee) {
        selectedEmployee = employee;
        showDetailModal = true;
        
        // Fetch and update schedule
        const schedules = await fetchEmployeeSchedule(employee.id);
        selectedEmployee = {
            ...selectedEmployee,
            scheduleHistory: schedules
        };
    }

    function closeEmployeeDetail() {
        showDetailModal = false;
        selectedEmployee = null;
    }

    // Debounced filter function
    let filterTimeout;
    function debouncedFetchEmployees(filters) {
        clearTimeout(filterTimeout);
        filterTimeout = setTimeout(() => {
            if (!loading) {
                fetchEmployees(filters);
            }
        }, 300);
    }

    // Initialize data
    onMount(() => {
        fetchEmployees(filterState);
    });

    // Cleanup on component destruction
    onDestroy(() => {
        clearTimeout(filterTimeout);
    });

    // Reactive statement for filter changes
    $: {
        debouncedFetchEmployees(filterState);
    }
</script>

<main class="dashboard">
    <div class="container">
        <!-- Header Section -->
        <div class="header">
            <div class="header-text">
                <h1>Staff Schedule Dashboard</h1>
                <p>Manage and track employee work locations</p>
            </div>
            <button on:click={toggleFilters} class="filter-toggle">
                <svg class="icon" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
        </div>

        {#if loading}
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading data...</p>
            </div>
        {:else if error}
            <div class="error">
                <svg class="icon" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{error}</p>
            </div>
        {:else}
            <!-- Filters Section -->
            {#if showFilters}
                <div class="filters">
                    <div class="filter-grid">
                        <!-- Search Input -->
                        <div class="filter-item">
                            <label for="search-staff">Search Staff</label>
                            <div class="search-input">
                                <input
                                    id="search-staff"
                                    type="text"
                                    bind:value={searchQuery}
                                    placeholder="Name or department..."

                                />
                                <svg class="icon" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>


                        <!-- Department Filter -->
                        <div class="filter-item">
                            <label for="department-filter">Department</label>
                            <select id="department-filter" bind:value={selectedDepartment}>
                                <option value="All">All Departments</option>
                                {#each departments as dept}
                                    <option value={dept}>{dept}</option>
                                {/each}
                            </select>
                        </div>






                        <!-- Work Status Filter -->
                        <div class="filter-item">
                            <label for="status-filter">Work Status</label>
                            <select id="status-filter" bind:value={selectedStatus}>
                                <option value="All">All Statuses</option>
                                <option value="office">In Office</option>
                                <option value="remote">Remote</option>
                            </select>
                        </div>






                        <!-- Date Range -->
                        <div class="filter-item">
                            <label for="date-range-filter">Date Range</label>
                            <select id="date-range-filter" bind:value={selectedDateRange}>
                                <option value="today">Today</option>
                                <option value="custom">Custom Range</option>
                            </select>
                            
                            {#if selectedDateRange === 'custom'}
                                <div class="date-range">
                                    <input
                                        type="date"
                                        bind:value={startDate}
                                    />
                                    <input
                                        type="date"
                                        bind:value={endDate}
                                    />
                                </div>
                            {/if}
                        </div>






                    </div>
                </div>
            {/if}

            <!-- Stats Overview -->
            <div class="stats">
                <div class="stat-card">
                    <div>
                        <p class="stat-label">Total Staff</p>
                        <p class="stat-value">{totalEmployees}</p>
                    </div>
                    <div class="stat-icon">
                        <svg viewBox="0 0 24 24">
                            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>

                </div>


                <div class="stat-card">
                    <div>
                        <p class="stat-label">In Office</p>
                        <p class="stat-value office">{officeEmployees.length}</p>
                        <p class="stat-percentage">{officePercentage}% of total</p>
                    </div>
                    <div class="stat-icon office">
                        <svg viewBox="0 0 24 24">
                            <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
















                    </div>
                </div>

                <div class="stat-card">
                    <div>
                        <p class="stat-label">Remote</p>
                        <p class="stat-value remote">{remoteEmployees.length}</p>
                        <p class="stat-percentage">{remotePercentage}% of total</p>
                    </div>
                    <div class="stat-icon remote">
                        <svg viewBox="0 0 24 24">
                            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>














                    </div>
                </div>
            </div>


            <!-- Tab Navigation -->
            <div class="tabs">
                <button 
                    class="tab {activeTab === 'all' ? 'active' : ''}"
                    on:click={() => activeTab = 'all'}
                >
                    All Staff
                </button>
                <button 
                    class="tab {activeTab === 'office' ? 'active' : ''}"
                    on:click={() => activeTab = 'office'}
                >
                    In Office
                </button>
                <button 
                    class="tab {activeTab === 'remote' ? 'active' : ''}"
                    on:click={() => activeTab = 'remote'}
                >
                    Remote
                </button>
            </div>

            <!-- Employee Grid -->
            <div class="employee-grid">
                {#each activeTab === 'all' ? filteredEmployees : 
                       activeTab === 'office' ? officeEmployees : 
                       remoteEmployees as employee (employee.id)}
                    <button
                        class="employee-card"
                        on:click={() => openEmployeeDetail(employee)}
                    >
                        <div class="employee-info">
                            <div class="employee-avatar">
                                {getEmployeeInitials(employee.name)}
                            </div>
                            <div class="employee-details">
                                <p class="employee-name">{employee.name}</p>
                                <p class="employee-dept">{employee.department} • {employee.team}</p>
                                <span class="status-badge {employee.status}">
                                    {employee.status}
                                </span>
                            </div>
                        </div>
                    </button>
                {/each}
            </div>

            <!-- Employee Detail Modal -->
            {#if showDetailModal && selectedEmployee}
            <div 
            class="modal-backdrop" 
            on:click={closeEmployeeDetail}
            on:keydown={(e) => {
                if (e.key === 'Escape') {
                    closeEmployeeDetail();
                }
            }}
            role="button"
            tabindex="0"
        >
        </div>
        
                <div class="modal">
                    <div class="modal-content">
                        <button class="modal-close" on:click={closeEmployeeDetail}>
                            <svg viewBox="0 0 24 24">
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div class="modal-header">
                            <div class="employee-avatar large">
                                {getEmployeeInitials(selectedEmployee.name)}
                            </div>
                            <div class="modal-title">
                                <h3>{selectedEmployee.name}</h3>
                                <p>{selectedEmployee.department} • {selectedEmployee.team}</p>
                            </div>
                        </div>

                        <div class="modal-details">
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <dt>Employee ID</dt>
                                    <dd>{selectedEmployee.id}</dd>
                                </div>
                                <div class="detail-item">
                                    <dt>Manager</dt>
                                    <dd>{selectedEmployee.manager}</dd>
                                </div>
                                <div class="detail-item">
                                    <dt>Email</dt>
                                    <dd>{selectedEmployee.email}</dd>
                                </div>
                                <div class="detail-item">
                                    <dt>Phone</dt>
                                    <dd>{selectedEmployee.phone}</dd>
                                </div>
                                <div class="detail-item">
                                    <dt>Join Date</dt>
                                    <dd>{selectedEmployee.joinDate}</dd>
                                </div>
                                <div class="detail-item">
                                    <dt>Current Status</dt>
                                    <dd>
                                        <span class="status-badge {selectedEmployee.status}">
                                            {selectedEmployee.status}
                                        </span>
                                    </dd>
                                </div>
                            </div>
                        </div>

                        <div class="schedule-history">
                            <h4>Schedule History</h4>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Hours</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each selectedEmployee.scheduleHistory as schedule}
                                        <tr>
                                            <td>{schedule.date}</td>
                                            <td>{schedule.hours}</td>
                                            <td>
                                                <span class="status-badge {schedule.status}">
                                                    {schedule.status}
                                                </span>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>

                        <div class="modal-actions">
                            <button class="secondary" on:click={closeEmployeeDetail}>
                                Close
                            </button>
                            <button 
                                class="primary"
                                on:click={() => updateEmployeeStatus(
                                    selectedEmployee.id,
                                    selectedEmployee.status === 'office' ? 'remote' : 'office')}>
                        </div>
                    </div>
                </div>
            {/if}
        {/if}
    </div>
</main>
<style>
    .dashboard {
        min-height: 100vh;
        background-color: #f9fafb;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .header h1 {
        font-size: 1.875rem;
        font-weight: bold;
        color: #111827;
    }

    .header p {
        color: #6b7280;
        margin-top: 0.25rem;
    }

    .icon {
        width: 20px;
        height: 20px;
        fill: none;
        stroke: currentColor;
    }

    .filter-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        cursor: pointer;
    }

    .filter-toggle:hover {
        background: #f9fafb;
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 16rem;
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .spinner {
        width: 3rem;
        height: 3rem;
        border: 4px solid #e5e7eb;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { 
            transform: rotate(360deg); 
        }
    }

    .error {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: #fee2e2;
        border: 1px solid #ef4444;
        border-radius: 0.5rem;
        color: #b91c1c;
    }

    .filters {
        background: white;
        padding: 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        margin-bottom: 2rem;
    }

    .filter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
    }

    .filter-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .filter-item label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
    }

    .filter-item input,
    .filter-item select {
        padding: 0.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.375rem;
        width: 100%;
    }

    .search-input {
        position: relative;
    }

    .search-input input {
        padding-left: 2.5rem;
    }

    .search-input .icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        width: 16px;
        height: 16px;
    }

    .date-range {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }

    .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        display: flex;
        justify-content: space-between;
        align-items: start;
    }

    .stat-label {
        font-size: 0.875rem;
        color: #6b7280;
    }

    .stat-value {
        font-size: 1.875rem;
        font-weight: bold;
        color: #111827;
        margin: 0.25rem 0;
    }

    .stat-percentage {
        font-size: 0.875rem;
        color: #6b7280;
    }

    .stat-icon {
        padding: 0.75rem;
        border-radius: 9999px;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .stat-icon.office {
        background: #dcfce7;
        color: #16a34a;
    }

    .stat-icon.remote {
        background: #dbeafe;
        color: #2563eb;
    }

    .stat-value.office {
        color: #16a34a;
    }

    .stat-value.remote {
        color: #2563eb;
    }

    .tabs {
        display: flex;
        gap: 0.25rem;
        background: #f3f4f6;
        padding: 0.25rem;
        border-radius: 0.5rem;
        margin-bottom: 1.5rem;
    }

    .tab {
        flex: 1;
        padding: 0.5rem 1rem;
        text-align: center;
        font-size: 0.875rem;
        font-weight: 500;
        color: #6b7280;
        border-radius: 0.375rem;
        cursor: pointer;
        border: none;
        background: none;
    }

    .tab:hover {
        color: #374151;
    }

    .tab.active {
        background: white;
        color: #111827;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .employee-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
    }

    .employee-card {
        background: white;
        padding: 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        border: none;
        width: 100%;
        text-align: left;
        cursor: pointer;
        transition: box-shadow 0.2s;
    }

    .employee-card:hover {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .employee-info {
        display: flex;
        gap: 1rem;
        align-items: start;
    }

    .employee-avatar {
        width: 3rem;
        height: 3rem;
        background: #f3f4f6;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        color: #4b5563;
    }

    .employee-avatar.large {
        width: 4rem;
        height: 4rem;
        font-size: 1.25rem;
    }

    .employee-details {
        flex: 1;
        min-width: 0;
    }

    .employee-name {
        font-size: 1rem;
        font-weight: 600;
        color: #111827;
        margin-bottom: 0.25rem;
    }

    .employee-dept {
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 0.5rem;
    }

    .status-badge {
        display: inline-flex;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: capitalize;
    }

    .status-badge.office {
        background: #dcfce7;
        color: #16a34a;
    }

    .status-badge.remote {
        background: #dbeafe;
        color: #2563eb;
    }

    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
    }

    .modal {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        z-index: 50;
    }

    .modal-content {
        background: white;
        border-radius: 0.75rem;
        width: 100%;
        max-width: 42rem;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        padding: 1.5rem;
    }

    .modal-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        padding: 0.5rem;
        color: #6b7280;
        border: none;
        background: none;
        cursor: pointer;
    }

    .modal-close:hover {
        color: #374151;
    }

    .modal-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
    }

    .modal-title h3 {
        font-size: 1.5rem;
        font-weight: 600;
        color: #111827;
    }

    .modal-title p {
        color: #6b7280;
        font-size: 0.875rem;
    }

    .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 1.5rem;
        padding: 1.5rem 0;
        border-top: 1px solid #e5e7eb;
    }

    .detail-item dt {
        font-size: 0.875rem;
        font-weight: 500;
        color: #6b7280;
        margin-bottom: 0.5rem;
    }

    .detail-item dd {
        font-size: 0.875rem;
        color: #111827;
    }

    .schedule-history {
        border-top: 1px solid #e5e7eb;
        padding-top: 1.5rem;
    }

    .schedule-history h4 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
        margin-bottom: 1rem;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th {
        text-align: left;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: #374151;
        background: #f9fafb;
    }

    td {
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        color: #111827;
        border-bottom: 1px solid #e5e7eb;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e5e7eb;
    }

    button.primary {
        background: #2563eb;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        border: none;
        cursor: pointer;
    }

    button.primary:hover {
        background: #1d4ed8;
    }

    button.secondary {
        background: white;
        color: #374151;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        border: 1px solid #e5e7eb;
        cursor: pointer;
    }

    button.secondary:hover {
        background: #f9fafb;
    }

    @media (max-width: 640px) {
        .container {
            padding: 1rem;
        }

        .employee-grid {
            grid-template-columns: 1fr;
        }

        .modal-content {
            margin: 0;
            max-height: 100vh;
            border-radius: 0;
        }

        .detail-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
