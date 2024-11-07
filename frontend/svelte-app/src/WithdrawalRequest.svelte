<script>
    import { onMount } from "svelte";
    import config from './config.json';
    let withdrawalRequests = [];
    let loading = false;
    let error = null;
    
    // Get employee ID from your auth system
    const employeeId = localStorage.getItem('employeeId');

    async function fetchWithdrawalRequests() {
        loading = true;
        error = null;
        try {
            const response = await fetch(`${config.base_url}/get_user_applications?eid=${employeeId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched data:", data);

            // Filter for Approved applications
            withdrawalRequests = data.filter(app => 
                app.status === 'Approved'
            );

        } catch (err) {
            error = "Failed to load applications. Please try again later.";
            console.error("Error fetching applications:", err);
        } finally {
            loading = false;
        }
    }

    async function requestWithdrawal(applicationId) {
        try {
            const response = await fetch(`${config.base_url}/withdraw_application/${applicationId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    employee_id: employeeId
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit withdrawal request');
            }

            const result = await response.json();
            alert('Withdrawal request submitted successfully');
            await fetchWithdrawalRequests(); // Refresh the list
            
        } catch (err) {
            alert(err.message || 'Error submitting withdrawal request. Please try again.');
            console.error("Error requesting withdrawal:", err);
        }
    }

    function formatDate(dateValue) {
        if (!dateValue) return 'N/A';
        
        try {
            let date;
            if (typeof dateValue === 'object' && dateValue.seconds) {
                date = new Date(dateValue.seconds * 1000);
            } else if (typeof dateValue === 'string') {
                date = new Date(dateValue);
            } else {
                date = new Date(dateValue);
            }
            
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (err) {
            console.error('Error formatting date:', err);
            return 'Invalid Date';
        }
    }

    onMount(fetchWithdrawalRequests);
</script>

<div class="container">
    <h1>Withdrawal Requests</h1>

    {#if loading}
        <div class="loading">Loading applications...</div>
    {:else if error}
        <div class="error">{error}</div>
    {:else if withdrawalRequests.length === 0}
        <div class="empty-state">
            <h3>No Applications Available</h3>
            <p>You have no approved applications available for withdrawal at this time.</p>
        </div>
    {:else}
        {#each withdrawalRequests as application}
            <div class="withdrawal-card">
                <div class="card-header">
                    <h3>Application Details</h3>
                    <span class="status {application.status}">
                        {application.status}
                    </span>
                </div>
                
                <div class="card-body">
                    <p><strong>Date:</strong> {formatDate(application.date)}</p>
                    <p><strong>Type:</strong> {application.type || 'N/A'}</p>
                    {#if application.half_day}
                        <p><strong>Half Day:</strong> Yes</p>
                    {/if}
                    {#if application.days}
                        <p><strong>Days:</strong> {application.days}</p>
                    {/if}
                    {#if application.reason}
                        <p><strong>Reason:</strong> {application.reason}</p>
                    {/if}
                </div>

                <div class="card-footer">
                    {#if application.status === 'Approved'}
                        <button 
                            on:click={() => requestWithdrawal(application.id)}
                            class="withdrawal-button">
                            Request Withdrawal
                        </button>
                    {:else if application.status === 'Withdrawn'}
                        <span class="withdrawn-message">
                            Withdrawal request submitted
                        </span>
                    {/if}
                </div>
            </div>
        {/each}
    {/if}
</div>

<style>
    /* Styles remain unchanged */
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

    .status.Approved {
        background-color: #4CAF50;
        color: white;
    }

    .status.Withdrawn {
        background-color: #F44336;
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

    .withdrawn-message {
        color: #F44336;
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

    .empty-state {
        padding: 3rem 1rem;
    }

    .empty-state h3 {
        color: #2C3E50;
        margin-bottom: 1rem;
    }

    .empty-state p {
        color: #666;
    }

    :global(.ec-events) {
        margin: 0 4px 0 4px !important;
    } 
</style>