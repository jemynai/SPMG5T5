<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    let step = 1;
    let selectedDate = "";
    let isDateValid = false;
    let applicationType = "one-time";
    let selectedDays = [];
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    let selectedDayOption = "full-day";
    let showPartDayOptions = false;
    let selectedHalfDay = "";
    let reason = "";
    let reviewMode = false;

    // Date validation to ensure selected date is at least 24 hours in the future
    const validateDate = () => {
        let now = new Date();
        let selected = new Date(selectedDate);
        let diffInMilliseconds = selected.getTime() - now.getTime();
        let diffInHours = diffInMilliseconds / (1000 * 60 * 60);
        isDateValid = diffInHours >= 24;
    };

    const nextStep = () => {
        if (step === 1 && (!selectedDate || !isDateValid)) {
            alert("Please select a valid date at least 24 hours from now.");
            return;
        }
        if (step === 2 && applicationType === "weekly" && selectedDays.length === 0) {
            alert("Please select at least one day.");
            return;
        }
        if (step === 3 && selectedDayOption === "part-day" && !selectedHalfDay) {
            alert("Please select AM or PM for Part Day.");
            return;
        }
        if (step === 4 && reason.trim() === "") {
            alert("Please provide a reason.");
            return;
        }
        if (step === 4) {
            reviewMode = true;
        } else {
            step += 1;
        }
    };

    const prevStep = () => {
        step -= 1;
    };

    const handleApplicationTypeChange = (e) => {
        applicationType = e.target.value;
        if (applicationType === "one-time") {
            selectedDays = [];
        }
    };

    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            selectedDays = selectedDays.filter((d) => d !== day);
        } else if (selectedDays.length < 3) {
            selectedDays = [...selectedDays, day];
        } else {
            alert("You can only select up to 3 days.");
        }
    };

    const handleKeyPress = (event, day) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleDay(day);
        }
    };

    const handleDayOptionChange = (e) => {
        selectedDayOption = e.target.value;
        showPartDayOptions = selectedDayOption === "part-day";
        if (selectedDayOption !== "part-day") {
            selectedHalfDay = "";
        }
    };

    const selectHalfDay = (period) => {
        selectedHalfDay = period;
    };

    const handleModalClick = (e) => {
        if (e.target === e.currentTarget) {
            dispatch("close");
        }
    };

    const handleModalKeydown = (e) => {
        if (e.key === 'Escape') {
            dispatch("close");
        }
    };

    const handleSubmit = async () => {
        const applicationData = {
            employee_id: "YOUR_EMPLOYEE_ID",
            date: selectedDate,
            type: applicationType,
            days: selectedDays,
            halfDay: selectedDayOption === "full-day" ? "Full Day" : selectedHalfDay,
            reason: reason,
            status: "Pending",
        };

        try {
            const response = await fetch("http://127.0.0.1:5000/create_arrangement", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(applicationData),
            });

            if (response.ok) {
                alert("Application submitted successfully!");
                dispatch("close");
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert(`Submission failed: ${error.message}`);
        }
    };

    const backToEdit = () => {
        reviewMode = false;
    };
</script>

<div 
    class="modal-backdrop" 
    on:click={handleModalClick}
    on:keydown={handleModalKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
>
    <div 
        class="modal-content" 
        role="document"
    >
        <button 
            class="close-button" 
            on:click={() => dispatch("close")}
            aria-label="Close modal"
        >
            &times;
        </button>

        {#if reviewMode}
            <div class="review-box">
                <h3>Review your application</h3>
                <p><strong>Date:</strong> {selectedDate}</p>
                <p><strong>Application Type:</strong> {applicationType}</p>
                {#if applicationType === "weekly"}
                    <p><strong>Selected Days:</strong> {selectedDays.join(", ")}</p>
                {/if}
                <p><strong>Time:</strong> {selectedDayOption === "full-day" ? "Full Day" : selectedHalfDay}</p>
                <p><strong>Reason:</strong> {reason}</p>
            </div>
            <div class="buttons">
                <button class="back-button" on:click={backToEdit}>Back to Edit</button>
                <button class="next-button" on:click={handleSubmit}>Submit</button>
            </div>
        {:else}
            {#if step === 1}
                <h2 id="modal-title">Apply for WFH Arrangement</h2>
                <div class="form-group">
                    <label for="wfh-date">Select WFH Date:</label>
                    <input 
                        type="date" 
                        id="wfh-date" 
                        bind:value={selectedDate} 
                        on:change={validateDate}
                        min={new Date().toISOString().split('T')[0]} 
                    />
                </div>
            {:else if step === 2}
                <h3>Application Type</h3>
                <div class="form-group">
                    <label>
                        <input 
                            type="radio" 
                            name="applicationType" 
                            value="one-time" 
                            checked={applicationType === "one-time"} 
                            on:change={handleApplicationTypeChange}
                        /> 
                        One-time application
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            name="applicationType" 
                            value="weekly" 
                            checked={applicationType === "weekly"} 
                            on:change={handleApplicationTypeChange}
                        /> 
                        Repeated weekly
                    </label>
                    {#if applicationType === "weekly"}
                        <div class="days-selection">
                            <h4>Select Days (max 3):</h4>
                            <div role="group" aria-label="Day selection" class="days-container">
                                {#each daysOfWeek as day}
                                    <button 
                                        class="day-option {selectedDays.includes(day) ? 'selected' : ''}"
                                        on:click={() => toggleDay(day)}
                                        on:keypress={(e) => handleKeyPress(e, day)}
                                        aria-pressed={selectedDays.includes(day)}
                                    >
                                        {day}
                                    </button>
                                {/each}
                            </div>
                            <p class="selected-days">Selected: {selectedDays.join(", ") || "None"}</p>
                        </div>
                    {/if}
                </div>
            {:else if step === 3}
                <h3>Work Arrangement</h3>
                <div class="form-group">
                    <label>
                        <input 
                            type="radio" 
                            name="dayOption" 
                            value="full-day" 
                            checked={selectedDayOption === "full-day"} 
                            on:change={handleDayOptionChange}
                        /> 
                        Full Day
                    </label>
                    <label>
                        <input 
                            type="radio" 
                            name="dayOption" 
                            value="part-day" 
                            checked={selectedDayOption === "part-day"} 
                            on:change={handleDayOptionChange}
                        /> 
                        Part Day
                    </label>
                    {#if showPartDayOptions}
                        <div role="group" aria-label="Part day selection" class="part-day-options">
                            <button 
                                class="day-option {selectedHalfDay === 'AM' ? 'selected' : ''}"
                                on:click={() => selectHalfDay("AM")}
                                aria-pressed={selectedHalfDay === 'AM'}
                            >
                                AM
                            </button>
                            <button 
                                class="day-option {selectedHalfDay === 'PM' ? 'selected' : ''}"
                                on:click={() => selectHalfDay("PM")}
                                aria-pressed={selectedHalfDay === 'PM'}
                            >
                                PM
                            </button>
                        </div>
                    {/if}
                </div>
            {:else if step === 4}
                <h3>Reason</h3>
                <div class="form-group">
                    <textarea 
                        bind:value={reason} 
                        placeholder="Please provide a reason for your WFH request"
                        aria-label="Reason for WFH request"
                        rows="4"
                    ></textarea>
                </div>
            {/if}
            <div class="buttons">
                {#if step > 1}
                    <button class="back-button" on:click={prevStep}>Back</button>
                {/if}
                <button class="next-button" on:click={nextStep}>
                    {step === 4 ? 'Review' : 'Next'}
                </button>
            </div>
        {/if}
    </div>
</div>

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
        width: 90%;
        max-width: 500px;
        padding: 24px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        position: relative;
        max-height: 90vh;
        overflow-y: auto;
    }

    .close-button {
        position: absolute;
        top: 12px;
        right: 12px;
        background-color: transparent;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
    }

    .close-button:hover {
        background-color: #f0f0f0;
    }

    .form-group {
        margin: 16px 0;
    }

    .form-group label {
        display: block;
        margin: 8px 0;
    }

    .buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 24px;
    }

    .next-button,
    .back-button {
        padding: 10px 20px;
        font-size: 16px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .next-button {
        background-color: #4caf50;
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

    .days-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 12px 0;
    }

    .day-option {
        padding: 8px 16px;
        border-radius: 4px;
        background-color: #e0e0e0;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
    }

    .day-option:hover {
        background-color: #d0d0d0;
    }

    .day-option.selected {
        background-color: #4caf50;
        color: white;
    }

    .part-day-options {
        display: flex;
        gap: 12px;
        margin-top: 12px;
    }

    textarea {
        width: 100%;
        min-height: 100px;
        padding: 12px;
        border-radius: 4px;
        border: 1px solid #ccc;
        resize: vertical;
    }

    .review-box {
        background-color: #f7f7f7;
        padding: 16px;
        border-radius: 4px;
        margin-bottom: 20px;
    }

    .selected-days {
        margin-top: 8px;
        font-size: 0.9em;
        color: #666;
    }

    @media (max-width: 480px) {
        .modal-content {
            padding: 16px;
            width: 95%;
        }

        .days-container {
            justify-content: center;
        }

        .buttons {
            flex-direction: column-reverse;
            gap: 12px;
        }

        .buttons button {
            width: 100%;
        }
    }
</style>
