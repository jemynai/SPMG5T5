<script>
    import { onMount } from 'svelte';
    import { fetchTimetableByDepartment } from '../api'; 

    let loading = false;
    let error = '';
    let arrangements = [];
    let departmentID = '';
    let statusFilter = 'All';
    let officeCount = 0;
    let homeCount = 0;

    async function fetchTimetable() {
        loading = true;
        error = '';
        try {
            arrangements = await fetchTimetableByDepartment(departmentID, statusFilter);
            // Count statuses
            officeCount = arrangements.filter(a => a.status === 'Office').length;
            homeCount = arrangements.filter(a => a.status === 'Home').length;
        } catch (err) {
            error = 'Failed to fetch timetable. Please try again.';
        } finally {
            loading = false;
        }
    }

    onMount(fetchTimetable);
</script>

<style>
    /* Main layout */
    .hr-timetable-dashboard { padding: 20px; }
    .filters { display: flex; gap: 10px; margin-bottom: 20px; }
    .resource-dashboard { margin-top: 20px; }
    
    /* Table Styles */
    .resource-headers, .resource-item { display: grid; grid-template-columns: 1fr 2fr 1fr 2fr; padding: 5px; }
    .resource-headers { font-weight: bold; background-color: #f0f0f0; }
    .resource-item:nth-child(even) { background-color: #f9f9f9; }

    /* Error and Loading */
    .error-message { color: red; font-weight: bold; }

    /* Pie Chart */
    .pie-chart-container { display: flex; justify-content: center; margin-top: 20px; }
    .pie-chart { width: 150px; height: 150px; }
    .legend { display: flex; justify-content: center; gap: 10px; margin-top: 10px; }
    .legend-item { display: flex; align-items: center; gap: 5px; }
    .legend-color { width: 15px; height: 15px; }
    .office-color { background-color: #4CAF50; } /* Green for office */
    .home-color { background-color: #FF9800; } /* Orange for home */
</style>

<div class="hr-timetable-dashboard">
    <h1>HR View Timetable</h1>
    
    <div class="filters">
        <label>Department ID:</label>
        <input type="text" bind:value={departmentID} placeholder="Enter Department ID" />

        <label>Status:</label>
        <select bind:value={statusFilter}>
            <option>All</option>
            <option>Office</option>
            <option>Home</option>
        </select>

        <button on:click={fetchTimetable}>Fetch Timetable</button>
    </div>

    {#if loading}
        <p>Loading...</p>
    {/if}

    {#if error}
        <p class="error-message">{error}</p>
    {/if}

    {#if arrangements.length > 0}
        <div class="resource-dashboard">
            <div class="resource-headers">
                <span>ID</span>
                <span>Employee</span>
                <span>Status</span>
                <span>Details</span>
            </div>
            <div class="resource-list">
                {#each arrangements as arrangement (arrangement.id)}
                    <div class="resource-item">
                        <span>{arrangement.id}</span>
                        <span>{arrangement.employee}</span>
                        <span>{arrangement.status}</span>
                        <span>{arrangement.details}</span>
                    </div>
                {/each}
            </div>
        </div>
        
        <!-- Pie Chart -->
        <div class="pie-chart-container">
            <svg class="pie-chart" viewBox="0 0 32 32">
                <!-- Office slice -->
                <circle r="16" cx="16" cy="16" 
                        fill="transparent" stroke="#4CAF50" 
                        stroke-width="32" stroke-dasharray="{officeCount / (officeCount + homeCount) * 100} 100"
                        transform="rotate(-90) translate(-32)" />
                <!-- Home slice -->
                <circle r="16" cx="16" cy="16" 
                        fill="transparent" stroke="#FF9800" 
                        stroke-width="32" stroke-dasharray="{homeCount / (officeCount + homeCount) * 100} 100"
                        transform="rotate(-90) translate(-32)" />
            </svg>
        </div>
        
        <!-- Legend -->
        <div class="legend">
            <div class="legend-item">
                <div class="legend-color office-color"></div> Office ({officeCount})
            </div>
            <div class="legend-item">
                <div class="legend-color home-color"></div> Home ({homeCount})
            </div>
        </div>
    {/if}

    {#if !loading && !error && arrangements.length === 0}
        <p>No arrangements found for this department.</p>
    {/if}
</div>
