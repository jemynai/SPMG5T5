<script>
    import { onDestroy } from "svelte";
    import Router from "svelte-spa-router"; // Correct Router import
    import scheduleStore from "./schedule-store.js";
    import Calendar from "./Calendar.svelte";
    import Scheduler from "./Scheduler.svelte";
    import ApplyModal from "./Apply.svelte";
    import Arrangements from "./Arrangements.svelte";
    import WithdrawalRequest from "./WithdrawalRequest.svelte";

    let showModal = false;
    let schedule = {};
    let schedulerShowing = false;
    let dateID = "";
    let dateHeading = "";
    let appointments = [];

    const openModal = () => {
        showModal = true;
    };

    const closeModal = () => {
        showModal = false;
    };

    const unsubscribe = scheduleStore.subscribe((currState) => {
        schedule = currState;
    });

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
        return (dateHeading = date.toLocaleString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }));
    };

    const removeEmptyDate = () => {
        if (schedule[dateID] && schedule[dateID].length === 0) {
            scheduleStore.update((currDataState) => {
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
        let time = `${e.detail.hour}:${e.detail.minutes < 10 ? "0" + e.detail.minutes : e.detail.minutes}${e.detail.amOrPM}`;
        let newAppt = {
            id: Math.floor(Math.random() * 1000000),
            eventname: e.detail.eventName,
            time: time === ":0" ? "no time set" : time,
            completed: false,
        };

        if (!schedule[dateID]) {
            scheduleStore.update((currState) => {
                currState[dateID] = [newAppt];
                return currState;
            });
        } else {
            scheduleStore.update((currState) => {
                let currDayAppts = currState[dateID];
                currState[dateID] = [...currDayAppts, newAppt];
                return currState;
            });
        }
    };

    // Define routes for different pages
    const routes = {
        "/calendar": Calendar,
        "/arrangements": Arrangements,
        "/withdrawal-request": WithdrawalRequest,
        "/apply": ApplyModal,
    };
</script>

<main>
    <nav>
        <a href="/calendar">Calendar</a> <!-- Changed from "/" to "/calendar" -->
        <a href="/arrangements">Arrangements</a>
        <a href="/withdrawal-request">Withdrawals</a>
        <a href="/apply">Apply</a>
    </nav>
    

    <!-- Router to handle page navigation -->
    <Router {routes} />

    {#if schedulerShowing}
        <Scheduler
            on:modalClose={closeScheduler}
            on:addAppt={setApptToSch}
            {dateID}
            {dateHeading}
            {appointments}
        />
    {/if}

    <button class="apply-button" on:click={openModal}>Apply</button>

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
        background-color: #4caf50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .apply-button:hover {
        background-color: #45a049;
    }

    nav {
        margin-bottom: 20px;
    }

    nav a {
        margin-right: 10px;
        color: #007bff;
        text-decoration: none;
        font-size: 16px;
    }

    nav a:hover {
        text-decoration: underline;
    }
</style>
