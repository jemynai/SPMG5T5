<script>
    import { onMount, onDestroy } from 'svelte';
    import config from './config.json';
    
    let departments = [];
    let allEmployees = []; // Store all employees
    let showDetailModal = false;
    let selectedEmployee = null;
    let searchQuery = '';
    let selectedDepartment = 'All';
    let selectedStatus = 'All';
    let selectedDateRange = 'today';
    let startDate = '';
    let endDate = ''; 
    let loading = true;
    let error = null;
    let isRequestInProgress = false;

    let showFilters = true;
    let activeTab = 'all';

    const API_BASE_URL = config.base_url || 'http://localhost:5000';

    function getFilterState() {
        return {
            department: selectedDepartment,
            status: selectedStatus,
            search: searchQuery,
            dateRange: selectedDateRange,
            startDate,
            endDate
        };
    }

    // Client-side filtering function
    function filterEmployees(employees, filters) {
        return employees.filter(employee => {
            // Department filter
            if (filters.department && filters.department !== 'All' && 
                employee.department !== filters.department) {
                return false;
            }
            
            // Status filter
            if (filters.status && filters.status !== 'All' && 
                employee.status !== filters.status.toLowerCase()) {
                return false;
            }
            
            // Search filter
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const searchFields = [
                    employee.id,
                    employee.name,
                    employee.department,
                    employee.email,
                    employee.country,
                    employee.position
                ];
                return searchFields.some(field => 
                    String(field).toLowerCase().includes(searchTerm)
                );
            }
            
            return true;
        });
    }

    // Computed properties using filtered data
    $: filteredEmployees = allEmployees.length ? 
        filterEmployees(allEmployees, getFilterState()) : [];
    $: officeEmployees = filteredEmployees.filter(emp => emp.status === 'office');
    $: remoteEmployees = filteredEmployees.filter(emp => emp.status === 'remote');
    $: totalEmployees = filteredEmployees.length;
    $: officePercentage = totalEmployees ? 
        (officeEmployees.length / totalEmployees * 100).toFixed(1) : 0;
    $: remotePercentage = totalEmployees ? 
        (remoteEmployees.length / totalEmployees * 100).toFixed(1) : 0;

    async function fetchInitialData() {
        if (isRequestInProgress) return;
        
        try {
            isRequestInProgress = true;
            loading = true;

            // Fetch all data at once
            const [deptResponse, empResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/departments`),
                fetch(`${API_BASE_URL}/employees`)
            ]);

            if (!deptResponse.ok || !empResponse.ok) {
                throw new Error('Failed to fetch initial data');
            }

            const deptData = await deptResponse.json();
            const empData = await empResponse.json();

            departments = deptData.departments;
            allEmployees = empData.employees;
            error = null;
            
        } catch (err) {
            console.error('Error fetching initial data:', err);
            error = err.message || 'Failed to load data';
            departments = [];
            allEmployees = [];
        } finally {
            loading = false;
            isRequestInProgress = false;
        }
    }

    function toggleFilters() {
        showFilters = !showFilters;
    }

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
                throw new Error('Failed to update status');
            }

            // Refresh employee data after status update
            await fetchInitialData();
        } catch (err) {
            console.error('Error updating status:', err);
            error = err.message;
        }
    }

    onMount(async () => {
        await fetchInitialData();
    });

    onDestroy(() => {
        // Cleanup if needed
    });
</script>

<main class="dashboard">
    <div class="container">
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
            {#if showFilters}
                <div class="filters">
                    <div class="filter-grid">
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

                        <div class="filter-item">
                            <label for="department-filter">Department</label>
                            <select id="department-filter" bind:value={selectedDepartment}>
                                <option value="All">All Departments</option>
                                {#each departments as dept}
                                    <option value={dept}>{dept}</option>
                                {/each}
                            </select>
                        </div>

                        <div class="filter-item">
                            <label for="status-filter">Status</label>
                            <select id="status-filter" bind:value={selectedStatus}>
                                <option value="All">All Statuses</option>
                                <option value="office">In Office</option>
                                <option value="remote">Remote</option>
                            </select>
                        </div>

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

            <div class="employee-grid">
                {#each activeTab === 'all' ? filteredEmployees : 
                       activeTab === 'office' ? officeEmployees : 
                       remoteEmployees as employee (employee.id)}
                    <div class="employee-card">
                        <div class="employee-info">
                            <div class="employee-details">
                                <p class="employee-name">{employee.name}</p>
                                <p class="employee-dept">{employee.department} • {employee.team}</p>
                                <p class="employee-email">{employee.email}</p>
                                <div class="status-wrapper">
                                    <span class="status-badge {employee.status}">
                                        {employee.status}
                                    </span>
                                    <button 
                                        class="status-toggle"
                                        on:click={() => updateEmployeeStatus(
                                            employee.id, 
                                            employee.status === 'office' ? 'remote' : 'office'
                                        )}
                                    >
                                        Toggle Status
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</main>

<style>
    /* All the existing styles remain the same */
    .status-wrapper {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 0.5rem;
    }

    .status-toggle {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        border-radius: 0.375rem;
        background-color: #f3f4f6;
        border: 1px solid #e5e7eb;
        cursor: pointer;
    }

    .status-toggle:hover {
        background-color: #e5e7eb;
    }
</style>