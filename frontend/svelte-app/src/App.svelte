
<script>
    import { onDestroy } from 'svelte';
    import scheduleStore from './schedule-store.js'; // Assuming you have a store managing the schedule state
    import Calendar from './Calendar.svelte';
    import Scheduler from './Scheduler.svelte';
    import ApplyModal from './Apply.svelte'; // Import the modal component

    let showModal = false; // Modal visibility flag, initially hidden
    let schedule = {};
    let schedulerShowing = false;   
    let dateID = "";
    let dateHeading = "";

    // Function to open the modal
    const openModal = () => {
        showModal = true; // Set modal to visible when "Apply" is clicked
    };

    // Function to close the modal (passed down to Apply.svelte)
    const closeModal = () => {
        showModal = false; // Set modal to hidden
    };

    // Subscribe to the schedule store
    const unsubscribe = scheduleStore.subscribe(currState => {
        schedule = currState;
    });

    // Clean up when component is destroyed
    onDestroy(() => {
        if (unsubscribe) unsubscribe();
    });

    const handleScheduler = (e) => {
        schedulerShowing = true;
        dateID = e.target.dataset.dateid;
        makeDateHeading();
    };

    const makeDateHeading = () => {
        let dateAsHeading = dateID.replace(/_/g, " ");
        let date = new Date(`${dateAsHeading}`);
        return dateHeading = date.toLocaleString("en-US", { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const removeEmptyDate = () => {
        if (schedule[dateID] && schedule[dateID].length === 0) {
            scheduleStore.update(currDataState => {
                delete currDataState[dateID];
                return currDataState;
            });
        }
    };

    const closeScheduler = () => {
        schedulerShowing = false;
        removeEmptyDate();
    };

    const setApptToSch = (e) => {
        let time = `${e.detail.hour}:${e.detail.minutes < 10 ? '0' + e.detail.minutes : e.detail.minutes}${e.detail.amOrPM}`;
        let newAppt = {
            id: Math.floor(Math.random() * 1000000),
            eventname: e.detail.eventName,
            time: time === ":0" ? "no time set" : time,
            completed: false
        };

        if (!schedule[dateID]) {
            scheduleStore.update(currState => { 
                currState[dateID] = [newAppt]; 
                return currState;
            });
        } else {
            scheduleStore.update(currState => {
                let currDayAppts = currState[dateID];
                currState[dateID] = [...currDayAppts, newAppt];
                return currState;
            });
        }
    };
</script>

<main>
    <!-- Display Calendar -->
    <Calendar on:click={handleScheduler} {schedule} />

    <!-- Scheduler shows when user clicks a date in the calendar -->
    {#if schedulerShowing}
        <Scheduler on:modalClose={closeScheduler}
                   on:addAppt={setApptToSch}
                   {dateID}
                   {dateHeading}
                   {appointments} />
    {/if}

    <!-- Apply Button on the Front Page -->
    <button class="apply-button" on:click={openModal}>Apply</button>

    <!-- The Apply Modal component (conditionally rendered based on showModal) -->
    {#if showModal}
        <ApplyModal on:close={closeModal} />
    {/if}
</main>

<style>
    main {
        font-family: Verdana, sans-serif;
    }

    .apply-button {
        padding: 10px 20px;
        font-size: 18px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .apply-button:hover {
        background-color: #45a049;
    }
</style>

