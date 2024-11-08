<script>
    import { writable } from 'svelte/store';

    // Import components
    import ApplyModal from "./Apply.svelte";
    import WithdrawalRequest from "./WithdrawalRequest.svelte";
    import HRViewTimetable from './HRViewTimetable.svelte';
    import ManagerTimetable from './ManagerTimetable.svelte';
    import EmployeeTimetable from './EmployeeTimetable.svelte';
    import CancelRequest from './CancelRequest.svelte';

    import { jwtToken, userClaims } from './authstore';
    import Login from './Login.svelte';

    let isLoggedIn = $jwtToken !== '';
    $: isLoggedIn = $jwtToken !== '';

    // Claims access
    const userId = $userClaims.sub;
    const role = $userClaims.role;
    const firstName = $userClaims.first_name;
    const lastName = $userClaims.last_name;

    // Create stores for route management
    const currentRoute = writable('/');
    const isRouteTransitioning = writable(false);

    // Modal state
    let showModal = false;

    // Modal handlers
    const openModal = () => {
        showModal = true;
        console.log("Modal opened");
    };
    const closeModal = () => {
        showModal = false;
        console.log("Modal closed");
    };

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
<!-- Top Navigation -->
<nav class="top-nav">
    <button 
        class="nav-link" 
        on:click={() => navigateTo('/employee-timetable')}
        class:active={$currentRoute === '/employee-timetable'}
    >
        My Timetable
    </button>
    <button 
        class="nav-link" 
        on:click={() => navigateTo('/withdrawal-request')}
        class:active={$currentRoute === '/withdrawal-request'}
    >
        Withdrawal Requests
    </button>
    <button 
        class="nav-link" 
        on:click={() => navigateTo('/hr-view-timetable')}
        class:active={$currentRoute === '/hr-view-timetable'}
    >
        HR Timetable
    </button>
    <button 
        class="nav-link" 
        on:click={() => navigateTo('/manager-timetable')}
        class:active={$currentRoute === '/manager-timetable'}
    >
        Manager Timetable
    </button>
    <button 
        class="nav-link" 
        on:click={() => navigateTo('/cancel-request')}
        class:active={$currentRoute === '/cancel-request'}
    >
        Cancel Request
    </button>
    <button 
        class="nav-link right apply-button" 
        on:click={openModal}
        class:active={$currentRoute === '/apply'}
    >
        Apply
    </button>
    <button 
        class="nav-link" 
    >
        Logout
    </button>
</nav>
<main>
    <!-- Main Content with Route Rendering -->
    <div class="content" class:transitioning={$isRouteTransitioning}>
        {#if $currentRoute === '/withdrawal-request'}
            <WithdrawalRequest />
        {:else if $currentRoute === '/apply'}
            <ApplyModal on:close={closeModal} />
        {:else if $currentRoute === '/employee-timetable'}
            <EmployeeTimetable />
        {:else if $currentRoute === '/hr-view-timetable'}
            <HRViewTimetable />
        {:else if $currentRoute === '/manager-timetable'}
            <ManagerTimetable />
        {:else if $currentRoute === '/cancel-request'}
            <CancelRequest />
        {/if}
    </div>

    <!-- Apply Button to Open Modal -->
    <button class="apply-button" on:click={openModal}>Apply</button>

    <!-- Apply Modal with close event listener -->
    {#if showModal}
        <ApplyModal on:close={closeModal} />
    {/if}
</main>
{:else}
<Login />
{/if}

<style>
    main {
        font-family: Verdana, sans-serif;
        padding: 4rem;
        max-width: 1200px;
        margin: 0 auto;
    }

    .top-nav {
        position: fixed;
        width: 100%;
        z-index: 1000;
        margin-bottom: 2rem;
        border-bottom: 1px solid #eaeaea;
        display: flex;
        justify-content: space-between;
        box-sizing: border-box;
        gap: 1rem;
        background-color: #ffffff;
        padding: 8px 1rem 0 0;
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
    
    .right {
        margin-left: auto
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
