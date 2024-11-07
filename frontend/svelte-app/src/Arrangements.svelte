<script>
    import { onMount } from "svelte";
    import config from './config.json';
    let arrangements = [];
    let showModal = false; // Variable to control modal visibility
    let selectedArrangement = null; // Track the selected arrangement for withdrawal
  
    async function fetchArrangements() {
        try {
            const response = await fetch(`${config.base_url}/get_arrangements?eid=YOUR_EMPLOYEE_ID`);
            const data = await response.json();
            arrangements = data.arrangements;
        } catch (err) {
            console.error("Error fetching arrangements:", err);
        }
    }
  
    function openModal(arrangement) {
        selectedArrangement = arrangement;
        showModal = true;
    }
  
    function closeModal() {
        showModal = false;
        selectedArrangement = null;
    }
  
    async function requestWithdrawal(arrangementId) {
        try {
            const response = await fetch(`${config.base_url}/request_withdrawal/${arrangementId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const result = await response.json();
            alert(result.message);
            closeModal(); // Close the modal after requesting withdrawal
        } catch (err) {
            console.error("Error requesting withdrawal:", err);
        }
    }
  
    onMount(fetchArrangements);
  </script>
  
  <style>
    .arrangement-card {
        border: 1px solid #ccc;
        padding: 1rem;
        margin: 0.5rem 0;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    button {
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
    button:hover {
        background-color: #45a049;
    }
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .modal {
        background-color: white;
        padding: 1rem;
        border-radius: 8px;
        width: 300px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    .close-button {
        float: right;
        cursor: pointer;
        font-size: 1.2rem;
        color: #333;
    }
  </style>
  
  <h1>Your Arrangements</h1>
  {#each arrangements as arrangement}
    <div class="arrangement-card">
        <p>Date: {new Date(arrangement.date.seconds * 1000).toLocaleDateString()}</p>
        <p>Shift: {arrangement.shift}</p>
        <p>Status: {arrangement.status}</p>
        <p>Notes: {arrangement.notes}</p>
        {#if arrangement.status === 'approved'}
            <button on:click={() => openModal(arrangement)}>Request Withdrawal</button>
        {/if}
    </div>
  {/each}
  
  {#if showModal}
    <div class="modal-backdrop" on:click={closeModal}>
        <div class="modal" on:click|stopPropagation>
            <span class="close-button" on:click={closeModal}>&times;</span>
            <h2>Request Withdrawal</h2>
            <p>Are you sure you want to request a withdrawal for this arrangement?</p>
            <button on:click={() => requestWithdrawal(selectedArrangement.id)}>Confirm</button>
        </div>
    </div>
  {/if}
  
