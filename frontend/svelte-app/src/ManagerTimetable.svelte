<script>
  let departmentId = '';
  let statusFilter = '';
  let arrangements = [];
  let summary = { total: 0, status_distribution: { office: { count: 0 }, home: { count: 0 } } };
  let error = '';
  let loading = false;

  async function fetchTimetableData() {
    if (!departmentId) {
      error = 'Please enter a department ID';
      return;
    }

    loading = true;
    error = '';

    try {
      let url = `http://localhost:8080/mngr_view_ttbl?department_id=${encodeURIComponent(departmentId)}`;
      if (statusFilter) {
        url += `&status=${encodeURIComponent(statusFilter)}`;
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
      summary = { total: 0, status_distribution: { office: { count: 0 }, home: { count: 0 } } };
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

<div class="container">
  <h1>Team Timetable Dashboard</h1>

  <div class="controls">
    <input
      type="text"
      placeholder="Enter Department ID"
      bind:value={departmentId}
    />
    <select bind:value={statusFilter}>
      <option value="">All Locations</option>
      <option value="office">Office</option>
      <option value="home">Home</option>
    </select>
    <button 
      on:click={fetchTimetableData} 
      disabled={loading}
    >
      {loading ? 'Loading...' : 'View Timetable'}
    </button>
  </div>

  {#if error}
    <div class="error">
      {error}
    </div>
  {/if}

  {#if summary.total > 0}
    <div class="stats">
      <h2>Summary</h2>
      <ul>
        <li>Total Arrangements: {summary.total}</li>
        <li>Office: {summary.status_distribution.office.count} 
            ({summary.status_distribution.office.percentage}%)
        </li>
        <li>Home: {summary.status_distribution.home.count}
            ({summary.status_distribution.home.percentage}%)
        </li>
      </ul>
    </div>
  {/if}

  <div class="arrangements">
    {#each arrangements as arrangement (arrangement.id)}
      <div class="arrangement-card {arrangement.status}">
        <div class="arrangement-header">
          <h3>Employee ID: {arrangement.employee_id}</h3>
          <span class="status">{arrangement.status}</span>
        </div>
        <div class="arrangement-details">
          <p>Arrangement ID: {arrangement.id}</p>
          <p>Department ID: {arrangement.department_id}</p>
          <p>Created: {formatDate(arrangement.created_at)}</p>
          <p>Updated: {formatDate(arrangement.updated_at)}</p>
          {#if arrangement.details}
            <p>Location: {arrangement.details.location || 'N/A'}</p>
            <p>Description: {arrangement.details.description || 'N/A'}</p>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  h1 {
    margin-bottom: 20px;
  }

  .controls {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  input, select, button {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    background: #007bff;
    color: white;
    border: none;
    cursor: pointer;
  }

  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .error {
    padding: 10px;
    background: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
    border-radius: 4px;
    margin-bottom: 20px;
  }

  .stats {
    margin: 20px 0;
    padding: 15px;
    background: #f5f5f5;
    border-radius: 4px;
  }

  .stats ul {
    list-style: none;
    padding: 0;
  }

  .stats li {
    margin: 5px 0;
  }

  .arrangements {
    display: grid;
    gap: 15px;
  }

  .arrangement-card {
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .arrangement-card.office {
    background: #e3f2fd;
  }

  .arrangement-card.home {
    background: #e8f5e9;
  }

  .arrangement-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .status {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.875em;
    text-transform: uppercase;
  }

  .office .status {
    background: #bbdefb;
  }

  .home .status {
    background: #c8e6c9;
  }

  .arrangement-details {
    font-size: 0.875em;
    color: #666;
  }

  .arrangement-details p {
    margin: 5px 0;
  }
</style>