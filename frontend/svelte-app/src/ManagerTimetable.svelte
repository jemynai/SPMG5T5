<script>
  import { onMount } from 'svelte';
  
  let departmentId = '';
  let searchQuery = '';
  let selectedStatus = 'All';
  let arrangements = [];
  let summary = { 
    total: 0, 
    status_distribution: { 
      office: { count: 0, percentage: 0 }, 
      home: { count: 0, percentage: 0 } 
    } 
  };
  let error = '';
  let loading = false;
  let activeTab = 'all'; // 'all', 'office', 'home'
  let hasSearched = false; // New flag to track if search was attempted

  // Derived lists
  $: filteredArrangements = arrangements.filter(arr => {
    if (searchQuery) {
      const searchTerm = searchQuery.toLowerCase();
      return arr.employee_id.toLowerCase().includes(searchTerm) ||
             (arr.details?.location || '').toLowerCase().includes(searchTerm);
    }
    return true;
  });

  $: officeArrangements = filteredArrangements.filter(arr => arr.status === 'office');
  $: homeArrangements = filteredArrangements.filter(arr => arr.status === 'home');

  async function fetchTimetableData() {
    if (!departmentId) {
      error = 'Please enter a department ID';
      return;
    }

    loading = true;
    error = '';
    hasSearched = true;

    try {
      let url = `http://localhost:8080/mngr_view_ttbl?department_id=${encodeURIComponent(departmentId)}`;
      if (selectedStatus !== 'All') {
        url += `&status=${encodeURIComponent(selectedStatus.toLowerCase())}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch timetable data');
      }

      arrangements = result.arrangements;
      summary = result.summary;
    } catch (err) {
      error = err.message || 'Error fetching timetable data';
      arrangements = [];
      summary = { 
        total: 0, 
        status_distribution: { 
          office: { count: 0, percentage: 0 }, 
          home: { count: 0, percentage: 0 } 
        } 
      };
    } finally {
      loading = false;
    }
  }

  function formatDate(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
</script>

<main class="dashboard">
  <div class="container">
    <!-- Header Section -->
    <div class="header">
      <div class="header-text">
        <h1>Team Schedule Dashboard</h1>
        <p>Track your team's work locations</p>
      </div>
    </div>

    <!-- Department ID Input -->
    <div class="department-input">
      <input
        type="text"
        placeholder="Enter Department ID"
        bind:value={departmentId}
        class="input-field"
      />
      <button 
        on:click={fetchTimetableData} 
        disabled={loading}
        class="view-button"
      >
        {loading ? 'Loading...' : 'View Schedule'}
      </button>
    </div>

    {#if loading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading data...</p>
      </div>
    {:else if error && hasSearched}
      <div class="error">
        <svg class="icon" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>{error}</p>
      </div>
    {:else}
      <!-- Stats Overview (Always shown) -->
      <div class="stats">
        <div class="stat-card {!hasSearched ? 'placeholder' : ''}">
          <div>
            <p class="stat-label">Total Team Members</p>
            <p class="stat-value">{hasSearched ? summary.total : '–'}</p>
          </div>
          <div class="stat-icon">
            <svg viewBox="0 0 24 24">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>

        <div class="stat-card {!hasSearched ? 'placeholder' : ''}">
          <div>
            <p class="stat-label">In Office</p>
            <p class="stat-value office">{hasSearched ? summary.status_distribution.office.count : '–'}</p>
            <p class="stat-percentage">{hasSearched ? `${summary.status_distribution.office.percentage}% of total` : 'Enter department ID'}</p>
          </div>
          <div class="stat-icon office">
            <svg viewBox="0 0 24 24">
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        <div class="stat-card {!hasSearched ? 'placeholder' : ''}">
          <div>
            <p class="stat-label">Remote</p>
            <p class="stat-value remote">{hasSearched ? summary.status_distribution.home.count : '–'}</p>
            <p class="stat-percentage">{hasSearched ? `${summary.status_distribution.home.percentage}% of total` : 'Enter department ID'}</p>
          </div>
          <div class="stat-icon remote">
            <svg viewBox="0 0 24 24">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        </div>
      </div>

      {#if hasSearched && summary.total > 0}
        <!-- Search and Filters -->
        <div class="filters">
          <div class="search-input">
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search by employee ID or location..."
            />
            <svg class="icon" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Tab Navigation -->
        <div class="tabs">
          <button 
            class="tab {activeTab === 'all' ? 'active' : ''}"
            on:click={() => activeTab = 'all'}
          >
            All Members
          </button>
          <button 
            class="tab {activeTab === 'office' ? 'active' : ''}"
            on:click={() => activeTab = 'office'}
          >
            In Office
          </button>
          <button 
            class="tab {activeTab === 'home' ? 'active' : ''}"
            on:click={() => activeTab = 'home'}
          >
            Remote
          </button>
        </div>

        <!-- Employee Grid -->
        <div class="employee-grid">
          {#each activeTab === 'all' ? filteredArrangements : 
                 activeTab === 'office' ? officeArrangements : 
                 homeArrangements as arrangement (arrangement.id)}
            <div class="employee-card {arrangement.status}">
              <div class="employee-info">
                <div class="employee-avatar">
                  {arrangement.employee_id.substring(0, 2).toUpperCase()}
                </div>
                <div class="employee-details">
                  <p class="employee-name">Employee ID: {arrangement.employee_id}</p>
                  <p class="employee-dept">Location: {arrangement.details?.location || 'N/A'}</p>
                  <div class="timestamps">
                    <span>Created: {formatDate(arrangement.created_at)}</span>
                    <span>Updated: {formatDate(arrangement.updated_at)}</span>
                  </div>
                  <span class="status-badge {arrangement.status}">
                    {arrangement.status}
                  </span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else if !hasSearched}
        <div class="welcome-message">
          <div class="welcome-icon">📊</div>
          <h2>Welcome to Team Schedule Dashboard</h2>
          <p>Enter your department ID above to view team schedules and work arrangements.</p>
          <div class="features">
            <div class="feature">
              <span class="feature-icon">👥</span>
              <span>Track team members</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🏢</span>
              <span>Monitor office presence</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🏠</span>
              <span>View remote workers</span>
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

  .department-input {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .input-field {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }

  .view-button {
    padding: 0.75rem 1.5rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  .view-button:hover {
    background: #1d4ed8;
  }

  .view-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
  }

  .spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid #e5e7eb;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background: #fee2e2;
    border-radius: 0.5rem;
    color: #dc2626;
  }

  .filters {
    background: white;
    padding: 1.5rem;
    border-radius: 0.75rem;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .search-input {
    position: relative;
  }

  .search-input input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }

  .search-input .icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.25rem;
    height: 1.25rem;
    color: #9ca3af;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.75rem;
    display: flex;
    justify-content: space-between;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
    width: 3rem;
    height: 3rem;
  }

  .stat-icon.office {
    background: #dcfce7;
    color: #16a34a;
  }

  .stat-icon.remote {
    background: #dbeafe;
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
    padding: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    background: none;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
  }

  .tab.active {
    background: white;
          color: #111827; }

  .employee-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .employee-card {
    background: white;
    padding: 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .employee-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .employee-card.office {
    border-left: 4px solid #16a34a;
  }

  .employee-card.home {
    border-left: 4px solid #2563eb;
  }

  .employee-info {
    display: flex;
    gap: 1rem;
  }

  .employee-avatar {
    width: 3rem;
    height: 3rem;
    background: #f3f4f6;
    border-radius: 9999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: #4b5563;
    flex-shrink: 0;
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

  .timestamps {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.75rem;
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

  .status-badge.home {
    background: #dbeafe;
    color: #2563eb;
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }

  @media (max-width: 640px) {
    .container {
      padding: 1rem;
    }

    .department-input {
      flex-direction: column;
    }

    .stats {
      grid-template-columns: 1fr;
    }

    .employee-grid {
      grid-template-columns: 1fr;
    }

    .timestamps {
      flex-direction: column;
    }
  }
  .placeholder {
    opacity: 0.7;
  }

  .welcome-message {
    text-align: center;
    padding: 3rem 1rem;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-top: 2rem;
  }

  .welcome-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .welcome-message h2 {
    color: #111827;
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .welcome-message p {
    color: #6b7280;
    margin-bottom: 2rem;
  }

  .features {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
  }

  .feature {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #4b5563;
  }

  .feature-icon {
    font-size: 1.25rem;
  }

  @media (max-width: 640px) {
    .features {
      flex-direction: column;
      gap: 1rem;
    }  }
</style>