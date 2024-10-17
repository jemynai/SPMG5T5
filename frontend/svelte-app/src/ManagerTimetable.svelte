<script>
    import { onMount } from 'svelte';

    let department_id = ''; // Bound to user input
    let status_filter = ''; // Bound to user input (optional)
    let arrangements = []; // Store fetched timetable data
    let errorMessage = ''; // Display error messages

    // Function to fetch timetable based on department and optional status
    async function fetchTimetable() {
        errorMessage = ''; // Clear previous errors
        arrangements = []; // Reset timetable data

        if (!department_id) {
            errorMessage = "Department ID is required";
            return;
        }

        let url = `http://localhost:8000/mngr_view_ttbl?department_id=${department_id}`;
        if (status_filter) {
            url += `&status=${status_filter}`;
        }

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.arrangements) {
                arrangements = data.arrangements;
            } else {
                errorMessage = data.message || 'No arrangements found for this department';
            }
        } catch (error) {
            errorMessage = error.message;
        }
    }

    // Format the date in a human-readable way
    function formatDate(date) {
        const dateObj = new Date(Date.parse(date));
        return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();
    }
</script>

<main>
    <h1>Manager Timetable View</h1>

    <!-- Department ID Input -->
    <div>
        <label for="department_id">Department ID:</label>
        <input
            type="text"
            id="department_id"
            bind:value={department_id}
            placeholder="Enter Department ID"
        />
    </div>

    <!-- Status Filter (optional) -->
    <div>
        <label for="status_filter">Filter by Status (optional):</label>
        <select id="status_filter" bind:value={status_filter}>
            <option value="">All</option>
            <option value="office">Office</option>
            <option value="home">Home</option>
        </select>
    </div>

    <!-- Fetch Timetable Button -->
    <button on:click={fetchTimetable}>Fetch Timetable</button>

    <!-- Error Message -->
    {#if errorMessage}
        <p style="color:red">{errorMessage}</p>
    {/if}

    <!-- Display fetched timetable data -->
    <ul>
        {#each arrangements as arrangement}
            <li>
                <b>{arrangement.employee_id}</b>: 
                {arrangement.shift.toUpperCase()} WFH on 
                {formatDate(arrangement.date)} 
                (Status: {arrangement.status})
            </li>
        {/each}
    </ul>
</main>

<style>
    main {
        text-align: center;
        padding: 1em;
        max-width: 600px;
        margin: 0 auto;
    }

    div {
        margin-bottom: 1em;
    }

    input, select {
        padding: 0.5em;
        margin-left: 1em;
        font-size: 1em;
    }

    button {
        padding: 10px 20px;
        font-size: 1em;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    button:hover {
        background-color: #45a049;
    }

    ul {
        text-align: left;
        padding: 0;
    }

    li {
        list-style: none;
        background-color: #f9f9f9;
        margin: 0.5em 0;
        padding: 0.5em;
        border: 1px solid #ddd;
    }
</style>
