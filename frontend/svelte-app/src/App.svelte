<script>
    import ApplyModal from './Apply.svelte';
    import Arrangements from './Arrangements.svelte';
    import WithdrawalRequest from './WithdrawalRequest.svelte';
    import HRViewTimetable from './HRViewTimetable.svelte';
    import ViewOwnSchedule from './ViewOwnSchedule.svelte';
    import { writable } from 'svelte/store'; // To manage route state

    let showModal = false;
    const openModal = () => { showModal = true; };
    const closeModal = () => { showModal = false; };

    const routes = {
        '/arrangements': Arrangements,
        '/withdrawal-request': WithdrawalRequest,
        '/hr-view-timetable': HRViewTimetable,
        '/view-own-schedule': ViewOwnSchedule // Added route for the ViewOwnSchedule component
    };

    // Writable store for current route
    let currentRoute = writable('/'); // Default to home or any route you want

    // Function to navigate to different routes
    const navigateTo = (route) => {
        currentRoute.set(route);
    };
</script>

<main>
    <!-- Button to open the modal -->
    <button class="apply-button" on:click={openModal}>Apply</button>

    <!-- Modal for applying (conditionally rendered) -->
    {#if showModal}
        <ApplyModal on:close={closeModal} />
    {/if}

    <!-- Navigation Buttons (Example) -->
    <nav>
        <button on:click={() => navigateTo('/view-own-schedule')}>View Own Schedule</button>
        <button on:click={() => navigateTo('/arrangements')}>Arrangements</button>
        <button on:click={() => navigateTo('/withdrawal-request')}>Withdrawal Request</button>
        <button on:click={() => navigateTo('/hr-view-timetable')}>HR Timetable</button>
    </nav>

    <!-- Render the current component based on route -->
    {#if $currentRoute === '/view-own-schedule'}
        <ViewOwnSchedule />
    {/if}

    {#if $currentRoute === '/arrangements'}
        <Arrangements />
    {/if}

    {#if $currentRoute === '/withdrawal-request'}
        <WithdrawalRequest />
    {/if}

    {#if $currentRoute === '/hr-view-timetable'}
        <HRViewTimetable />
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

    nav {
        margin-top: 20px;
    }

    nav button {
        margin: 5px;
        padding: 10px;
        font-size: 16px;
    }
</style>
