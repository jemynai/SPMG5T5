<script>
    import { onMount } from "svelte";
    let withdrawals = [];

    async function fetchWithdrawalRequests() {
        try {
            const response = await fetch("http://localhost:5000/get_withdrawal_requests");
            const data = await response.json();
            withdrawals = data.withdrawals;
        } catch (err) {
            console.error("Error fetching withdrawal requests:", err);
        }
    }

    async function handleWithdrawal(arrangementId, decision) {
        try {
            const response = await fetch(`http://localhost:5000/handle_withdrawal/${arrangementId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ decision })
            });
            const result = await response.json();
            alert(result.message);
            fetchWithdrawalRequests(); // Refresh the list
        } catch (err) {
            console.error("Error handling withdrawal:", err);
        }
    }

    onMount(fetchWithdrawalRequests);
</script>

<style>
    .withdrawal-card {
        border: 1px solid #ccc;
        padding: 1rem;
        margin: 0.5rem 0;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .action-buttons {
        margin-top: 1rem;
    }
    button {
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
    button.reject {
        background-color: #f44336;
    }
    button:hover {
        opacity: 0.8;
    }
</style>

<h1>Withdrawal Requests</h1>
{#each withdrawals as withdrawal}
    <div class="withdrawal-card">
        <p>Employee: {withdrawal.employee_id}</p>
        <p>Date: {new Date(withdrawal.date.seconds * 1000).toLocaleDateString()}</p>
        <p>Status: {withdrawal.status}</p>
        <div class="action-buttons">
            <button on:click={() => handleWithdrawal(withdrawal.id, 'accept')}>Accept</button>
            <button class="reject" on:click={() => handleWithdrawal(withdrawal.id, 'reject')}>Reject</button>
        </div>
    </div>
{/each}
