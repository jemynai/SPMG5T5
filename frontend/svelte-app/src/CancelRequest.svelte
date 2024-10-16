<script>
    import { onMount } from 'svelte';  // Import onMount to fetch data when component mounts

    let tableData = [];  // Data array for the table
    let showModal = false;
    let selectedRow = null;

    // Function to fetch table data from the API
    async function fetchTableData() {
        try {
            const response = await fetch('http://127.0.0.1:5000/api/pending-arrangements'); // Update the URL as needed
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            tableData = await response.json(); // Parse the JSON response
        } catch (error) {
            console.error('Error fetching table data:', error);
        }
    }

    // Call fetchTableData when the component is first loaded
    onMount(fetchTableData);

    function editPage(person) {
        alert(`Editing shift!`);
    }

    function cancelAlert(person) {
        selectedRow = person;
        showModal = true;
    }

    function closeModal() {
        showModal = false;
        selectedRow = null;
    }

    function deleteRequest() {
        selectedRow.status = "cancelled";
        tableData = tableData.filter(person => person.status !== "cancelled");
        showModal = false;
        selectedRow = null;
    }
</script>

<main>
    <h1>Pending Arrangements</h1>

    <!-- Render the table dynamically -->
    <table>
        <thead>
            <tr>
                <th>Date Created</th>
                <th>Date of Shift</th>
                <th>Employee ID</th>
                <th>Notes</th>
                <th>Shift</th>
                <th>Status</th>
                <th>Supervisors</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {#each tableData as person}
                <tr>
                    <td>{person.created_at}</td>
                    <td>{person.date}</td>
                    <td>{person.employee_id}</td>
                    <td>{person.notes}</td>
                    <td>{person.shift}</td>
                    <td>{person.status}</td>
                    <td>{person.supervisors}</td>
                    <td>
                        <button on:click={() => editPage(person)}>Edit</button>
                        <button on:click={() => cancelAlert(person)}>Cancel</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>

    <!-- Modal -->
    {#if showModal}
        <div class="modal">
            <div class="modal-content">
                <p>Are you sure you want to cancel this request?</p>
                <button on:click={deleteRequest}>Yes</button>
                <button on:click={closeModal}>Back</button>
            </div>
        </div>
    {/if}
</main>

<style>
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        color: purple;
    }
    th, td {
        padding: 10px;
        border: 1px solid #ddd;
        text-align: center;
    }
    th {
        background-color: lavenderblush;
    }
    button {
        background-color: purple; 
        border: black;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 10px;
    }
    button:hover {
        background-color: lavenderblush; 
        border: 2px solid purple;
        color: purple;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 10px;
    }
    h1 {
        color: black;
        font-family: 'Times New Roman', Times, serif;
    }
    .modal {
        width: 25%;
        height: 25%;
        justify-content: center;
        align-items: center;
        margin: auto;
    }
    .modal-content {
        border: 2px solid purple;
        background-color: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        width: auto;
        height: auto;
        text-align: center;
    }
</style>
