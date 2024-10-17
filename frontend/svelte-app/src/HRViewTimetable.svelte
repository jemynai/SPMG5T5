<script>
    import { auth } from './firebase';  // Assuming Firebase has been initialized
    import { onMount } from 'svelte';

    let departmentID = '';  // Department ID input field
    let statusFilter = '';  // Filter by 'office' or 'home'
    let arrangements = [];  // Stores the arrangements data fetched from backend
    let loading = false;
    let error = null;

    // Fetch user token from Firebase
    const getUserToken = async () => {
        const user = auth.currentUser;
        if (user) {
            return await user.getIdToken();
        }
        return null;
    };

    // Fetch HR view timetable data from Flask backend
    const fetchHRViewTimetable = async () => {
        error = null;
        loading = true;

        const token = await getUserToken();

        if (!token) {
            error = "User not authenticated.";
            loading = false;
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/hr_view_ttbl?department_id=${departmentID}&status=${statusFilter}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                arrangements = data.arrangements;
            } else {
                const errorData = await response.json();
                error = errorData.error || "Failed to fetch arrangements";
            }
        } catch (err) {
            error = "Error fetching data: " + err.message;
        } finally {
            loading = false;
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        fetchHRViewTimetable();
    };

    // Fetch data on component mount (optional, if you want data by default)
    onMount(() => {
        fetchHRViewTimetable();
    });
</script>

<main>
    <h2>HR View Timetable</h2>

    <!-- Department ID and Status Filter Form -->
    <form on:submit={handleSubmit}>
        <label>
            Department ID:
            <input type="text" bind:value={departmentID} required />
        </label>

        <label>
            Status:
            <select bind:value={statusFilter}>
                <option value="">All</option>
                <option value="office">Office</option>
                <option value="home">Home</option>
            </select>
        </label>

        <button type="submit" disabled={loading}>Fetch Timetable</button>
    </form>

    <!-- Loading Indicator -->
    {#if loading}
        <p>Loading...</p>
    {/if}

    <!-- Error Message -->
    {#if error}
        <p style="color: red;">{error}</p>
    {/if}

    <!-- Timetable Data Display -->
    {#if arrangements.length > 0}
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Employee</th>
                    <th>Status</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
                {#each arrangements as arrangement}
                    <tr>
                        <td>{arrangement.id}</td>
                        <td>{arrangement.employee}</td>
                        <td>{arrangement.status}</td>
                        <td>{arrangement.details}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}

    <!-- No data found message -->
    {#if !loading && !error && arrangements.length === 0}
        <p>No arrangements found for this department.</p>
    {/if}
</main>

<style>
    main {
        font-family: Arial, sans-serif;
        padding: 20px;
    }

    form {
        margin-bottom: 20px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
    }

    th {
        background-color: #f2f2f2;
    }
</style>
