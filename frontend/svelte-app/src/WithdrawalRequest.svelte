<script>
    import { onMount } from "svelte";
    let withdrawalRequests = [];
    let loading = false;
    let error = null;

    async function fetchWithdrawalRequests() {
        loading = true;
        error = null;
        try {
            const response = await fetch("http://localhost:8080/get_arrangements");
            if (!response.ok) {
                throw new Error('Failed to fetch arrangements');
            }
            const data = await response.json();
            withdrawalRequests = data.arrangements.filter(arr => 
                arr.status === 'approved' || arr.status === 'pending_withdrawal'
            );
        } catch (err) {
            error = "Failed to load arrangements. Please try again later.";
            console.error("Error fetching arrangements:", err);
        } finally {
            loading = false;
        }
    }

    async function requestWithdrawal(arrangementId) {
        try {
            const response = await fetch(`http://localhost:8080/request_withdrawal/${arrangementId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit withdrawal request');
            }

            const result = await response.json();
            
            // Update the local state to reflect the change
            withdrawalRequests = withdrawalRequests.map(arr => 
                arr.id === arrangementId 
                    ? { ...arr, status: 'pending_withdrawal' }
                    : arr
            );

            alert(result.message || 'Withdrawal request submitted successfully');
        } catch (err) {
            alert('Error submitting withdrawal request. Please try again.');
            console.error("Error requesting withdrawal:", err);
        }
    }

    function formatDate(dateValue) {
        if (!dateValue) return 'N/A';
        
        // Handle both timestamp and regular date formats
        const date = dateValue.seconds 
            ? new Date(dateValue.seconds * 1000)
            : new Date(dateValue);
            
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    onMount(fetchWithdrawalRequests);
</script>

<div class="container">
    <h1>Withdrawal Requests</h1>

    {#if loading}
        <div class="loading">Loading arrangements...</div>
    {:else if error}
        <div class="error">{error}</div>
    {:else if withdrawalRequests.length === 0}
        <div class="empty-state">
            No arrangements available for withdrawal.
        </div>
    {:else}
        {#each withdrawalRequests as arrangement}
            <div class="withdrawal-card">
                <div class="card-header">
                    <h3>Arrangement Details</h3>
                    <span class="status {arrangement.status}">
                        {arrangement.status.replace('_', ' ')}
                    </span>
                </div>
                
                <div class="card-body">
                    <p><strong>Date:</strong> {formatDate(arrangement.date)}</p>
                    <p><strong>Shift:</strong> {arrangement.shift}</p>
                    {#if arrangement.notes}
                        <p><strong>Notes:</strong> {arrangement.notes}</p>
                    {/if}
                </div>

                <div class="card-footer">
                    {#if arrangement.status === 'approved'}
                        <button 
                            on:click={() => requestWithdrawal(arrangement.id)}
                            class="withdrawal-button">
                            Request Withdrawal
                        </button>
                    {:else if arrangement.status === 'pending_withdrawal'}
                        <span class="pending-message">
                            Withdrawal request pending
                        </span>
                    {/if}
                </div>
            </div>
        {/each}
    {/if}
</div>

<style>
    .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
    }

    h1 {
        text-align: center;
        color: #2C3E50;
        margin-bottom: 2rem;
    }

    .withdrawal-card {
        background: white;
        border: 1px solid #e1e1e1;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .card-header h3 {
        margin: 0;
        color: #2C3E50;
    }

    .status {
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        font-size: 0.875rem;
        font-weight: 500;
        text-transform: capitalize;
    }

    .status.approved {
        background-color: #4CAF50;
        color: white;
    }

    .status.pending_withdrawal {
        background-color: #FFA726;
        color: white;
    }

    .card-body {
        margin-bottom: 1rem;
    }

    .card-body p {
        margin: 0.5rem 0;
        color: #555;
    }

    .card-footer {
        margin-top: 1rem;
        display: flex;
        justify-content: flex-end;
    }

    .withdrawal-button {
        background-color: #f44336;
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
    }

    .withdrawal-button:hover {
        background-color: #d32f2f;
    }

    .pending-message {
        color: #FFA726;
        font-weight: 500;
    }

    .loading, .error, .empty-state {
        text-align: center;
        padding: 2rem;
        color: #666;
        background: #f5f5f5;
        border-radius: 8px;
        margin: 1rem 0;
    }

    .error {
        color: #f44336;
        background: #ffebee;
    }
</style>