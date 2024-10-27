<script>
    import { onMount } from "svelte";
    let withdrawalRequests = [];
    let current_user = ""; 

    async function fetchArrangementsForWithdrawal() {
        try {
            const response = await fetch(`http://localhost:8080/get_user_arrangements?eid=${current_user}`);
            if (!response.ok) {
                throw new Error('Failed to fetch arrangements');
            }
            const data = await response.json();
            withdrawalRequests = data.arrangements || [];
        } catch (err) {
            console.error("Error fetching arrangements:", err);
        }
    }

    // Handle withdrawal request
    async function submitWithdrawalRequest(arrangementId) {
        try {
            const response = await fetch(`http://localhost:8080/submit_withdrawal_request/${arrangementId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ eid: current_user }) // Send current user ID with the request
            });

            const result = await response.json();
            alert(result.message);
            fetchArrangementsForWithdrawal(); // Refresh the list after submitting a request
        } catch (err) {
            console.error("Error submitting withdrawal request:", err);
        }
    }

    // Fetch the current user's arrangements when the component mounts
    onMount(fetchArrangementsForWithdrawal);
</script>

<h1>Withdraw Arrangement Requests</h1>
<!-- Display arrangements that the user can request to withdraw -->
{#if withdrawalRequests.length > 0}
    {#each withdrawalRequests as arrangement}
        <div class="withdrawal-card">
            <p><strong>Employee:</strong> {arrangement.employee_id}</p>
            <p><strong>Date:</strong> {new Date(Date.parse(arrangement.date)).toLocaleDateString()}</p>
            <p><strong>Shift:</strong> {arrangement.shift.toUpperCase()}</p>
            <p><strong>Status:</strong> {arrangement.status}</p>
            {#if arrangement.status === 'pending'}
                <button on:click={() => submitWithdrawalRequest(arrangement.id)}>Request Withdrawal</button>
            {:else}
                <p>This arrangement is no longer pending and cannot be withdrawn.</p>
            {/if}
        </div>
    {/each}
{:else}
    <p>No arrangements available for withdrawal.</p>
{/if}

<style>
    h1 {
        text-align: center;
        color: #4CAF50;
    }
    .withdrawal-card {
        border: 1px solid #ccc;
        padding: 1rem;
        margin: 0.5rem 0;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    button {
        background-color: #f44336;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 1rem;
    }
    button:hover {
        opacity: 0.8;
    }
</style>
