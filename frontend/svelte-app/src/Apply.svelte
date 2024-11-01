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
                const data = await response.json();
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

<div class="modal-backdrop" on:click={() => dispatch("close")}>
    <div class="modal-content" on:click|stopPropagation>
        <button class="close-button" on:click={() => dispatch("close")}>&times;</button>

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
            <!-- Step 1: Date Selection -->
            {#if step === 1}
                <h2>Apply for WFH Arrangement</h2>
                <label for="wfh-date">Select WFH Date:</label>
                <input type="date" id="wfh-date" bind:value={selectedDate} on:change={validateDate} />
            {:else if step === 2}
                <!-- Step 2: Repeated Weekly or One-Time -->
                <h3>Application Type</h3>
                <label>
                    <input type="radio" name="applicationType" value="one-time" checked={applicationType === "one-time"} on:change={handleApplicationTypeChange} /> One-time application
                </label>
                <br />
                <label>
                    <input type="radio" name="applicationType" value="weekly" checked={applicationType === "weekly"} on:change={handleApplicationTypeChange} /> Repeated weekly
                </label>
                {#if applicationType === "weekly"}
                    <div>
                        <h4>Select Days:</h4>
                        {#each daysOfWeek as day}
                            <div class="day-option {selectedDays.includes(day) ? 'selected' : ''}" on:click={() => toggleDay(day)}>{day}</div>
                        {/each}
                        <p>Selected Days: {selectedDays.join(", ")}</p>
                    </div>
                {/if}
            {:else if step === 3}
                <!-- Step 3: Full Day or Part Day -->
                <h3>Work Arrangement</h3>
                <label>
                    <input type="radio" name="dayOption" value="full-day" checked={selectedDayOption === "full-day"} on:change={handleDayOptionChange} /> Full Day
                </label>
                <br />
                <label>
                    <input type="radio" name="dayOption" value="part-day" checked={selectedDayOption === "part-day"} on:change={handleDayOptionChange} /> Part Day
                </label>
                {#if showPartDayOptions}
                    <div class="part-day-options">
                        <div>
                            <button class="day-option {selectedHalfDay === 'AM' ? 'selected' : ''}" on:click={() => selectHalfDay("AM")}>AM</button>
                        </div>
                        <div>
                            <button class="day-option {selectedHalfDay === 'PM' ? 'selected' : ''}" on:click={() => selectHalfDay("PM")}>PM</button>
                        </div>
                    </div>
                {/if}
            {:else if step === 4}
                <!-- Step 4: Reason -->
                <h3>Reason</h3>
                <textarea bind:value={reason} placeholder="Please provide a reason for your WFH request"></textarea>
            {/if}
            <div class="buttons">
                {#if step > 1}
                    <button class="back-button" on:click={prevStep}>Back</button>
                {/if}
                <button class="next-button" on:click={nextStep}>Next</button>
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

    .next-button,
    .back-button {
        padding: 10px 20px;
        font-size: 16px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
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

    .day-option {
        display: inline-block;
        margin-right: 10px;
        cursor: pointer;
        padding: 5px;
        border-radius: 5px;
        background-color: #e0e0e0;
    }

    .selected {
        background-color: #4caf50;
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

    textarea {
        width: 100%;
        height: 80px;
        margin-top: 10px;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #ccc;
    }

    .review-box {
        background-color: #f7f7f7;
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 20px;
    }
</style>
