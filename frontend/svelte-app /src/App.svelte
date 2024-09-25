<script>
    import Calendar from './Calendar.svelte';
    import Scheduler from './Scheduler.svelte';
    import ApplyModal from './Apply.svelte'; // Import the modal component

    let showModal = false; // Modal visibility flag, initially hidden

    const openModal = () => {
        showModal = true; // Set modal to visible when "Apply" is clicked
    };

    const closeModal = () => {
        showModal = false; // Set modal to hidden
    };

    let schedule = {};
    let schedulerShowing = false;	
    let dateID = "";
    let dateHeading = "";

    $: appointments = schedule[dateID];

    const handleScheduler = (e) => {
        schedulerShowing = true;
        dateID = e.target.dataset.dateid;
        makeDateHeading();
    };

    const makeDateHeading = () => {
        let dateAsHeading = dateID.replace(/_/g, " ");
        let date = new Date(`${dateAsHeading}`);
        return dateHeading = date.toLocaleString("en-US", {day: 'numeric', month: 'long', year: 'numeric'} );
    };
</script>

<main>
    <Calendar on:click={handleScheduler} {schedule} />

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
    main { font-family: Verdana, sans-serif; }

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
