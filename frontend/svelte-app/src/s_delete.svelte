<script>
    import { onMount } from "svelte";
    let requests = [];
    let selectedRequest = null;
    import config from './config';

    // Fetch all WFH requests when the component is mounted
    onMount(async () => {
        try {
            const res = await fetch(`${config.base_url}/wfh_requests`);
            requests = await res.json();
        } catch (error) {
            console.error("Error fetching WFH requests:", error);
        }
    });

    // Function to select a request for viewing details
    const selectRequest = (request) => {
        selectedRequest = request;
    };

    // Function to remove a full request
    const removeRequest = async (requestId) => {
        try {
            await fetch(`${config.base_url}/delete_request/${requestId}`, { method: "DELETE" });
            // Refresh list of requests after deletion
            requests = requests.filter(r => r.id !== requestId);
            selectedRequest = null;  // Clear selection
        } catch (error) {
            console.error("Error deleting request:", error);
        }
    };

    // Function to remove a specific day from a request
    const removeDay = async (requestId, day) => {
        try {
            await fetch(`${config.base_url}/remove_day/${requestId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ day }),
            });
            // Update the UI by removing the day locally as well
            selectedRequest.days = selectedRequest.days.filter(d => d !== day);
        } catch (error) {
            console.error("Error removing day:", error);
        }
    };
</script>

<style>
    .list-container {
        margin: 20px;
        font-family: Arial, sans-serif;
    }

    .request-list {
        margin: 20px 0;
    }

    .request-item {
        padding: 10px;
        border-bottom: 1px solid #ddd;
        cursor: pointer;
    }

    .details {
        margin-top: 20px;
    }

    .remove-button {
        background-color: #e74c3c;
        color: white;
        padding: 5px 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .remove-day {
        background-color: #f39c12;
        color: white;
        padding: 5px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
</style>

<div class="list-container">
    <h2>All WFH Requests</h2>
    <div class="request-list">
        {#each requests as request}
            <div class="request-item" on:click={() => selectRequest(request)}>
                {request.employee_name} - {request.date}
            </div>
        {/each}
    </div>

    {#if selectedRequest}
        <div class="details">
            <h3>{selectedRequest.employee_name}'s Request Details</h3>
            <p><strong>Date:</strong> {selectedRequest.date}</p>
            <p><strong>Reason:</strong> {selectedRequest.reason}</p>
            <p><strong>Status:</strong> {selectedRequest.status}</p>
            <p><strong>Days:</strong></p>
            <ul>
                {#each selectedRequest.days as day}
                    <li>
                        {day} <button class="remove-day" on:click={() => removeDay(selectedRequest.id, day)}>Remove {day}</button>
                    </li>
                {/each}
            </ul>

            <button class="remove-button" on:click={() => removeRequest(selectedRequest.id)}>
                Remove Full Request
            </button>
        </div>
    {/if}
</div>
