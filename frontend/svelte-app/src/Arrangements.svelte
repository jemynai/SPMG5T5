<script>
  import { onMount } from "svelte";
  let arrangements = [];

  async function fetchArrangements() {
      try {
          const response = await fetch("http://localhost:5000/get_arrangements?eid=YOUR_EMPLOYEE_ID");
          const data = await response.json();
          arrangements = data.arrangements;
      } catch (err) {
          console.error("Error fetching arrangements:", err);
      }
  }

  async function requestWithdrawal(arrangementId) {
      try {
          const response = await fetch(`http://localhost:5000/request_withdrawal/${arrangementId}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              }
          });
          const result = await response.json();
          alert(result.message);
      } catch (err) {
          console.error("Error requesting withdrawal:", err);
      }
  }

  onMount(fetchArrangements);
</script>

<style>
  /* Add some styling to make it sleek */
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
</style>

<h1>Your Arrangements</h1>
{#each arrangements as arrangement}
  <div class="arrangement-card">
      <p>Date: {new Date(arrangement.date.seconds * 1000).toLocaleDateString()}</p>
      <p>Shift: {arrangement.shift}</p>
      <p>Status: {arrangement.status}</p>
      <p>Notes: {arrangement.notes}</p>
      {#if arrangement.status === 'approved'}
          <button on:click={() => requestWithdrawal(arrangement.id)}>Request Withdrawal</button>
      {/if}
  </div>
{/each}
