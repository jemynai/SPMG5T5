<script>
  import { onMount, onDestroy } from 'svelte';
  import { jwtToken, userClaims } from './authStore';
  import Login from './Login.svelte';
  
  let selectedStatus = 'All';
  let selectedDateRange = 'today';
  let startDate = '';
  let endDate = ''; 
  let employees = [];
  let loading = true;
  let error = null;
  let isRequestInProgress = false;
  let currentDepartment = '';

  let showFilters = true;
  let activeTab = 'all';
  let searchQuery = '';

  const API_BASE_URL = 'http://localhost:5000';

  // Subscribe to auth store changes
  $: isAuthenticated = !!$jwtToken;
  $: currentUser = $userClaims;

  function getFilterState() {
      return {
          status: selectedStatus,
          search: searchQuery,
          dateRange: selectedDateRange,
          startDate,
          endDate
      };
  }

  // Move the filtering logic to computed properties
  $: filteredEmployees = employees;
  $: officeEmployees = filteredEmployees.filter(emp => emp.status === 'office');
  $: remoteEmployees = filteredEmployees.filter(emp => emp.status === 'remote');
  $: totalEmployees = filteredEmployees.length;
  $: officePercentage = totalEmployees ? (officeEmployees.length / totalEmployees * 100).toFixed(1) : 0;
  $: remotePercentage = totalEmployees ? (remoteEmployees.length / totalEmployees * 100).toFixed(1) : 0;

  async function fetchEmployees(filters = {}) {
      if (isRequestInProgress || !isAuthenticated) return;
      
      try {
          isRequestInProgress = true;
          loading = true;

          const params = new URLSearchParams();
          if (filters.status && filters.status !== 'All') {
              params.append('status', filters.status.toLowerCase());
          }
          if (filters.search) {
              params.append('search', filters.search);
          }

          const response = await fetch(`${API_BASE_URL}/employees?${params.toString()}`, {
              headers: {
                  'Authorization': `Bearer ${$jwtToken}`
              }
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to fetch employees');
          }

          const data = await response.json();
          employees = data.employees;
          
          // Set the department name from the first employee (they're all in the same department)
          if (employees.length > 0) {
              currentDepartment = employees[0].department;
          }
          
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

  async function updateEmployeeStatus(employeeId, newStatus) {
      if (!isAuthenticated) return;
      
      try {
          const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/status`, {
              method: 'PUT',
              headers: {
                  'Authorization': `Bearer ${$jwtToken}`,
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: newStatus })
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to update status');
          }

          // Refresh employee list after successful update
          await fetchEmployees(getFilterState());
          
      } catch (err) {
          console.error('Error updating status:', err);
          error = err.message;
      }
  }

  function toggleFilters() {
      showFilters = !showFilters;
  }

  let filterTimeout;
  function debouncedFetchEmployees() {
      clearTimeout(filterTimeout);
      filterTimeout = setTimeout(() => {
          if (!isRequestInProgress && isAuthenticated) {
              fetchEmployees(getFilterState());
          }
      }, 500);
  }

  // Handle individual filter changes
  $: if (searchQuery !== undefined) debouncedFetchEmployees();
  $: if (selectedStatus !== undefined) debouncedFetchEmployees();
  $: if (selectedDateRange !== undefined) debouncedFetchEmployees();

  // Watch for auth changes and refetch data when authenticated
  $: if (isAuthenticated) {
      fetchEmployees(getFilterState());
  }

  onMount(async () => {
      if (isAuthenticated) {
          try {
              await fetchEmployees(getFilterState());
          } catch (err) {
              console.error('Error in initialization:', err);
              error = err.message;
          }
      }
  });

  onDestroy(() => {
      clearTimeout(filterTimeout);
  });
</script>

{#if !isAuthenticated}
    <Login />
{:else}
    <main class="dashboard">
        <div class="container">
            <div class="header">
                <div class="header-text">
                    <h1>{currentDepartment} Department Dashboard</h1>
                    <p>Welcome, {currentUser?.name || 'Manager'}</p>
                    <p class="subtitle">Manage and track employee work locations</p>
                </div>
                <div class="header-actions">
                    <button on:click={toggleFilters} class="filter-toggle">
                        <svg class="icon" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>
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
                                        placeholder="Search by name, email..."
                                    />
                                    <svg class="icon" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
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
                                    <p class="employee-dept">{employee.team}</p>
                                    <p class="employee-email">{employee.email}</p>
                                    <div class="status-section">
                                        <span class="status-badge {employee.status || 'office'}">
                                            {employee.status || 'office'}
                                        </span>
                                        <div class="status-actions">
                                            <button 
                                                class="status-button {employee.status === 'office' ? 'active' : ''}"
                                                on:click={() => updateEmployeeStatus(employee.id, 'office')}
                                            >
                                                Office
                                            </button>
                                            <button 
                                                class="status-button {employee.status === 'remote' ? 'active' : ''}"
                                                on:click={() => updateEmployeeStatus(employee.id, 'remote')}
                                            >
                                                Remote
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </main>
{/if}

<style>
  /* Previous styles remain the same */

  .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
  }

  .subtitle {
      color: #6b7280;
      font-size: 0.875rem;
  }

  .status-section {
      margin-top: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
  }

  .status-actions {
      display: flex;
      gap: 0.5rem;
  }

  .status-button {
      flex: 1;
      padding: 0.375rem;
      font-size: 0.75rem;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
  }

  .status-button:hover {
      background: #f9fafb;
  }

  .status-button.active {
      border-color: transparent;
  }

  .status-button.active:first-child {
      background: #dcfce7;
      color: #16a34a;
  }

  .status-button.active:last-child {
      background: #dbeafe;
      color: #2563eb;
  }

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
      align-items: start;
      margin-bottom: 2rem;
  }

  .header-text {
      flex: 1;
  }

  .header h1 {
      font-size: 1.875rem;
      font-weight: bold;
      color: #111827;
      margin-bottom: 0.25rem;
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
      transition: all 0.2s;
  }

  .filter-toggle:hover {
      background: #f9fafb;
      border-color: #d1d5db;
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
      font-size: 0.875rem;
  }

  .filter-item input:focus,
  .filter-item select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 2px solid rgba(59, 130, 246, 0.5);
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
      transition: all 0.2s;
  }

  .employee-card:hover {
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
  }

  .employee-info {
      display: flex;
      gap: 1rem;
      align-items: start;
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
      margin-bottom: 0.25rem;
  }

  .employee-email {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
      word-break: break-all;
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

  @media (max-width: 768px) {
      .container {
          padding: 1rem;
      }

      .header {
          flex-direction: column;
          gap: 1rem;
      }

      .header-actions {
          width: 100%;
      }

      .filter-toggle {
          width: 100%;
          justify-content: center;
      }

      .stats {
          grid-template-columns: 1fr;
      }

      .employee-grid {
          grid-template-columns: 1fr;
      }

      .filter-grid {
          grid-template-columns: 1fr;
      }

      .status-actions {
          flex-direction: row;
      }
  }

  @media (max-width: 480px) {
      .header h1 {
          font-size: 1.5rem;
      }

      .tabs {
          flex-direction: column;
      }

      .tab {
          width: 100%;
          padding: 0.75rem;
      }
  }
</style>