<script>
    import { createEventDispatcher } from 'svelte'; // Import event dispatcher
    const dispatch = createEventDispatcher(); // Create an event dispatcher
    // info to export: selectedDate, applicationType, selectedDays, selectedDayOption, selectedHalfDay, reason





    let step = 1; // Tracks the current step of the process

    // Step 1: Date selection
    let selectedDate = '';
    let isDateValid = false;

    // Step 2: Repeated weekly options
    let applicationType = 'one-time'; // Default is 'one-time'
    let selectedDays = [];
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    // Step 3: Full/Part day selection
    let selectedDayOption = 'full-day'; // Default to full day
    let showPartDayOptions = false; // Controls visibility of AM/PM options
    let selectedHalfDay = ''; // Store 'AM' or 'PM'

    // Step 4: Reason input
    let reason = '';

    // Validate date (must be at least 24 hours from now)
    const validateDate = () => {
        let now = new Date();
        let selected = new Date(selectedDate);
        let diffInMilliseconds = selected.getTime() - now.getTime();
        let diffInHours = diffInMilliseconds / (1000 * 60 * 60);
        isDateValid = diffInHours >= 24;
    };

    const nextStep = () => {
        // Validation for step 1 (date)
        if (step === 1 && (!selectedDate || !isDateValid)) {
            alert("Please select a valid date at least 24 hours from now.");
            return;
        }
        // Validation for step 2 (weekly day selection)
        if (step === 2 && applicationType === 'weekly' && selectedDays.length === 0) {
            alert("Please select at least one day.");
            return;
        }
        // Validation for step 3 (Full Day / Part Day)
        if (step === 3 && selectedDayOption === 'part-day' && !selectedHalfDay) {
            alert("Please select AM or PM for Part Day.");
            return;
        }
        // Validation for step 4 (reason)
        if (step === 4 && reason.trim() === '') {
            alert("Please provide a reason.");
            return;
        }

        step += 1; // Proceed to the next step or submission
        if (step > 4) {
            handleSubmit(); // Final submission on step 4
        }
    };

    const prevStep = () => {
        step -= 1; // Go back to the previous step
    };

    const handleApplicationTypeChange = (e) => {
        applicationType = e.target.value;
        if (applicationType === 'one-time') {
            selectedDays = []; // Reset selected days if 'one-time' is selected
        }
    };

    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            selectedDays = selectedDays.filter(d => d !== day); // Remove day if already selected
        } else if (selectedDays.length < 3) {
            selectedDays = [...selectedDays, day]; // Add day if under the max limit
        } else {
            alert("You can only select up to 3 days.");
        }
    };

    const handleDayOptionChange = (e) => {
        selectedDayOption = e.target.value;
        if (selectedDayOption === 'part-day') {
            showPartDayOptions = true;
        } else {
            showPartDayOptions = false; // Hide AM/PM options if 'Full Day' is selected
            selectedHalfDay = ''; // Reset AM/PM selection
        }
    };

    const selectHalfDay = (period) => {
        selectedHalfDay = period;
    };

    const handleSubmit = () => {
        // Final submission logic (you can replace this with an API call, etc.)
        alert(`Application submitted:\nDate: ${selectedDate}\nType: ${applicationType}\nDays: ${selectedDays.join(', ')}\nTime: ${selectedDayOption === 'full-day' ? 'Full Day' : selectedHalfDay}\nReason: ${reason}`);
        dispatch('close'); // Close the modal
    };
</script>

<style>
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

    .modal-content {
        background-color: white;
        border-radius: 8px;
        width: 400px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        position: relative;
    }

    .close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: transparent;
        border: none;
        font-size: 20px;
        cursor: pointer;
    }

    .buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
    }

    .next-button, .back-button {
        padding: 10px 20px;
        font-size: 16px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .next-button {
        background-color: #4CAF50;
        color: white;
    }

    .next-button:hover {
        background-color: #45a049;
    }

    .back-button {
        background-color: #f44336;
        color: white;
    }

    .back-button:hover {
        background-color: #d32f2f;
    }

    .day-option {
        display: inline-block;
        margin-right: 10px;
        cursor: pointer;
        padding: 5px;
        border-radius: 5px;
        background-color: #e0e0e0;
    }

    .selected {
        background-color: #4CAF50;
        color: white;
    }

    .time-label {
        font-size: 12px;
        margin-bottom: 4px;
    }

    .part-day-options {
        display: flex;
        justify-content: space-between;
    }

    input[type="radio"] {
        margin-right: 10px;
    }

    textarea {
        width: 100%;
        height: 80px;
        margin-top: 10px;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #ccc;
    }
</style>

<!-- Modal Content -->
<div class="modal-backdrop" on:click={() => dispatch('close')}>
    <div class="modal-content" on:click|stopPropagation>
        <button class="close-button" on:click={() => dispatch('close')}>&times;</button>

        <!-- Step 1: Date Selection -->
        {#if step === 1}
            <h2>Apply for WFH Arrangement</h2>
            <label for="wfh-date">Select WFH Date:</label>
            <input type="date" id="wfh-date" bind:value={selectedDate} on:change={validateDate} />

        <!-- Step 2: Repeated Weekly or One-Time -->
        {:else if step === 2}
            <h3>Application Type</h3>
            <label>
                <input type="radio" name="applicationType" value="one-time" checked={applicationType === 'one-time'} on:change={handleApplicationTypeChange} />
                One-time application
            </label>
            <br />
            <label>
                <input type="radio" name="applicationType" value="weekly" checked={applicationType === 'weekly'} on:change={handleApplicationTypeChange} />
                Repeated weekly
            </label>

            {#if applicationType === 'weekly'}
                <div>
                    <h4>Select Days:</h4>
                    {#each daysOfWeek as day}
                        <div class="day-option {selectedDays.includes(day) ? 'selected' : ''}" on:click={() => toggleDay(day)}>
                            {day}
                        </div>
                    {/each}
                    <p>Selected Days: {selectedDays.join(', ')}</p>
                </div>
            {/if}

        <!-- Step 3: Full Day or Part Day -->
        {:else if step === 3}
            <h3>Work Arrangement</h3>
            <label>
                <input type="radio" name="dayOption" value="full-day" checked={selectedDayOption === 'full-day'} on:change={handleDayOptionChange} />
                Full Day
            </label>
            <br />
            <label>
                <input type="radio" name="dayOption" value="part-day" checked={selectedDayOption === 'part-day'} on:change={handleDayOptionChange} />
                Part Day
            </label>

            {#if showPartDayOptions}
                <div class="part-day-options">
                    <div>
                        <div class="time-label">08:00 AM - 12:00 PM</div>
                        <button class="day-option {selectedHalfDay === 'AM' ? 'selected' : ''}" on:click={() => selectHalfDay('AM')}>AM</button>
                    </div>
                    <div>
                        <div class="time-label">12:00 PM - 6:00 PM</div>
                        <button class="day-option {selectedHalfDay === 'PM' ? 'selected' : ''}" on:click={() => selectHalfDay('PM')}>PM</button>
                    </div>
                </div>
            {/if}

        <!-- Step 4: Reason -->
        {:else if step === 4}
            <h3>Reason</h3>
            <textarea bind:value={reason} placeholder="Please provide a reason for your WFH request"></textarea>
        {/if}

        <!-- Buttons for Navigation -->
        <div class="buttons">
            {#if step > 1}
                <button class="back-button" on:click={prevStep}>Back</button>
            {/if}
            <button class="next-button" on:click={nextStep}>{step === 4 ? 'Submit' : 'Next'}</button>
        </div>
    </div>
</div>
