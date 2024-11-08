<script>
    import { onMount } from 'svelte';  // Import onMount to fetch data when component mounts
  
    import config from './config';
    let tableData = [];  // Data array for the table
    let showModal = false;
    let selectedRow = null;
    let current_user= '130002'; 
  
    // Function to fetch table data from the API
    async function fetchTableData() {
        try {
            const response = await fetch(`${config.base_url}/pending-arrangements?eid=${current_user}`); // Update the URL as needed
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            tableData = await response.json(); // Parse the JSON response
        } catch (error) {
            console.error('Error fetching table data:', error);
        }
    }
  
    async function cancelRequest() {
  
    try {
      const response = await fetch(`${config.base_url}/arrangements/cancel?aID=${selectedRow.arrangementId}`, {
          method: 'POST'
      });
  
    if (!response.ok) throw new Error("Failed to cancel request");
  
      // Refresh the table data after rejecting
      await fetchTableData();
      tableData = tableData.filter(person => person.status == "pending")
      showModal = false;
      selectedRow = null;
  
    } catch (error) {
      console.error("Error updating status:", error);
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
  
  </script>
  
  <main>
    <h1>Pending Arrangements</h1>
  
    <!-- Render the table dynamically -->
    <table>
        <thead>
            <tr>
                <th>Arrangement ID</th>
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
  
                    <td>{person.arrangementId}</td>
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
        <div class="overlay">
            <div class="modal-content">
                <p>Are you sure you want to cancel this request?</p>
                <button on:click={cancelRequest}>Yes</button>
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
    
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
   }
  
  /* Modal content styling */
   .modal-content {
      color:black;
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      width: 300px;
      text-align: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
   }
  
  </style>
  