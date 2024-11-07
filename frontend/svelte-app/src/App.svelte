<script>
    import { writable } from 'svelte/store';

    // Import components
    import ApplyModal from "./Apply.svelte";
    import Arrangements from "./Arrangements.svelte";
    import WithdrawalRequest from "./WithdrawalRequest.svelte";
    import HRViewTimetable from './HRViewTimetable.svelte';
    import ManagerTimetable from './ManagerTimetable.svelte';
    import ViewOwnSchedule from './ViewOwnSchedule.svelte';
    import CancelRequest from './CancelRequest.svelte';

    import { jwtToken, userClaims } from './authStore';
    import Login from './Login.svelte';

    let isLoggedIn = $jwtToken !== '';
    $: isLoggedIn = $jwtToken !== '';

    // claims access
    const userId = $userClaims.sub;
    const role = $userClaims.role;
    const firstName = $userClaims.first_name;
    const lastName = $userClaims.last_name;

    // Create stores for route management
    const currentRoute = writable('/arrangements');
    const isRouteTransitioning = writable(false);

    // Modal state
    let showModal = false;

    // Modal handlers
    const openModal = () => showModal = true;
    const closeModal = () => showModal = false;

    // Enhanced navigation function with transition handling
    const navigateTo = async (path) => {
        if ($currentRoute === path) return;
        
        isRouteTransitioning.set(true);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for transition
        currentRoute.set(path);
        isRouteTransitioning.set(false);
    };

    // Handle browser back/forward buttons
    if (typeof window !== 'undefined') {
        window.onpopstate = (event) => {
            if (event.state?.path) {
                navigateTo(event.state.path);
            }
        };
    }
</script>
{#if isLoggedIn}
<main>
    <nav class="top-nav">
        <button 
            class="nav-link" 
            on:click={() => navigateTo('/arrangements')}
            class:active={$currentRoute === '/arrangements'}
        >
            Arrangements
        </button>
        <button 
            class="nav-link" 
            on:click={() => navigateTo('/withdrawal-request')}
            class:active={$currentRoute === '/withdrawal-request'}
        >
            Withdrawals
        </button>
        <button 
            class="nav-link" 
            on:click={() => navigateTo('/apply')}
            class:active={$currentRoute === '/apply'}
        >
            Apply
        </button>
    </nav>

    <div class="content" class:transitioning={$isRouteTransitioning}>
        {#if $currentRoute === '/arrangements'}
            <Arrangements />
        {:else if $currentRoute === '/withdrawal-request'}
            <WithdrawalRequest />
        {:else if $currentRoute === '/apply'}
            <ApplyModal />
        {:else if $currentRoute === '/view-own-schedule'}
            <ViewOwnSchedule />
        {:else if $currentRoute === '/hr-view-timetable'}
            <HRViewTimetable />
        {:else if $currentRoute === '/manager-timetable'}
            <ManagerTimetable />
        {:else if $currentRoute === '/cancel-request'}
            <CancelRequest />
        {/if}
    </div>

    <button class="apply-button" on:click={openModal}>Apply</button>

    {#if showModal}
        <ApplyModal on:close={closeModal} />
    {/if}

    <!-- Navigation Buttons -->
    <nav class="function-nav">
        <button 
            on:click={() => navigateTo('/view-own-schedule')}
            class:active={$currentRoute === '/view-own-schedule'}
        >
            View Own Schedule
        </button>
        <button 
            on:click={() => navigateTo('/arrangements')}
            class:active={$currentRoute === '/arrangements'}
        >
            Arrangements
        </button>
        <button 
            on:click={() => navigateTo('/withdrawal-request')}
            class:active={$currentRoute === '/withdrawal-request'}
        >
            Withdrawal Request
        </button>
        <button 
            on:click={() => navigateTo('/hr-view-timetable')}
            class:active={$currentRoute === '/hr-view-timetable'}
        >
            HR Timetable
        </button>
        <button 
            on:click={() => navigateTo('/cancel-request')}
            class:active={$currentRoute === '/cancel-request'}
        >
            Cancel Request
        </button>
        <button 
        on:click={() => navigateTo('/manager-timetable')}
        class:active={$currentRoute === '/manager-timetable'}
    >
        ManagerTimetable 
    </button>
    </nav>
</main>
{:else}
<Login />
{/if}

<style>
    main {
        font-family: Verdana, sans-serif;
        padding: 1rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    .top-nav {
        margin-bottom: 2rem;
        padding: 1rem 0;
        border-bottom: 1px solid #eaeaea;
        display: flex;
        gap: 1rem;
    }

    .nav-link {
        background: none;
        border: none;
        color: #007bff;
        font-size: 1rem;
        padding: 0.5rem 1rem;
        cursor: pointer;
        transition: all 0.2s;
        border-radius: 0.375rem;
    }

    .nav-link:hover {
        background-color: #f0f4ff;
    }

    .nav-link.active {
        background-color: #007bff;
        color: white;
    }

    .content {
        margin: 2rem 0;
        opacity: 1;
        transition: opacity 0.2s ease-in-out;
    }

    .content.transitioning {
        opacity: 0;
    }

    .apply-button {
        padding: 0.75rem 1.5rem;
        font-size: 1.125rem;
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .apply-button:hover {
        background-color: #45a049;
    }

    .function-nav {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin: 2rem 0;
    }

    .function-nav button {
        padding: 0.5rem 1rem;
        background-color: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.875rem;
    }

    .function-nav button:hover {
        background-color: #e0e0e0;
    }

    .function-nav button.active {
        background-color: #e0e0e0;
        border-color: #aaa;
    }

    @media (max-width: 768px) {
        .top-nav {
            flex-direction: column;
        }

        .function-nav {
            flex-direction: column;
        }
        
        .function-nav button {
            width: 100%;
        }
    }
</style>