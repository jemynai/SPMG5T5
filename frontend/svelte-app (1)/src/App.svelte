<script>
	import { onDestroy } from 'svelte';
	import scheduleStore from './schedule-store.js';
	import Calendar from './Calendar.svelte';
	import Scheduler from './Scheduler.svelte';
	
	let schedule = {};
	const unsubscribe = scheduleStore.subscribe(currState => {
		schedule = currState;
		// localStorage.setItem("storedSchedule", schedule)
	});
	
	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});
	
	let schedulerShowing = false;	
	let dateID = "";
	let dateHeading = "";

	$: appointments = schedule[dateID];
	
	const makeDateHeading = () => {
		let dateAsHeading = dateID.replace(/_/g, " ");
		let date = new Date(`${dateAsHeading}`);
		return dateHeading = date.toLocaleString("en-US", {day: 'numeric', month: 'long', year: 'numeric'} );
	}
	
	const handleScheduler = (e) => {
		schedulerShowing = true;
		dateID = e.target.dataset.dateid;
		makeDateHeading();
	}
	
	const removeEmptyDate = () => {
		if (schedule[dateID] && schedule[dateID].length === 0) {
			scheduleStore.update(currDataState => {
				delete currDataState[dateID];
				return currDataState
			});
		}
		return;
	}
	
	const closeScheduler = () => {
		schedulerShowing = false;
		removeEmptyDate();
	}
	
	const setApptToSch = (e) => {
		//console.log(e.detail)
		let time = `${e.detail.hour}:${e.detail.minutes < 10 ? '0'+e.detail.minutes : e.detail.minutes}${e.detail.amOrPM}`;
		
		let newAppt = {
			id: Math.floor(Math.random() * 1000000),
			eventname: e.detail.eventName,
			time: time === ":0" ? "no time set" : time,
			completed: false
		};
		
		if (!schedule[dateID]) {
			scheduleStore.update(currState => { 
				currState[dateID] = [newAppt]; 
				return currState 
			})
		} else {
			scheduleStore.update(currState => {
				let currDayAppts = currState[dateID];
				currState[dateID] = [...currDayAppts, newAppt];
				return currState 
			})
		}
		
// 		if (!schedule[dateID]) {
// 			schedule[dateID] = [newAppt];
// 			console.log("First and only appt of this day entered");
// 		} else {
// 			let currSchedAppts = schedule[dateID];
// 			schedule[dateID] = [...currSchedAppts, newAppt]
// 		}	
	}
	
	$: console.log(schedule)
</script>


<main>
	<Calendar on:click={handleScheduler}
						{schedule} />
		{#if schedulerShowing}
			<Scheduler on:modalClose={closeScheduler}
								 on:addAppt={setApptToSch}
								 {dateID}
								 {dateHeading}
								 {appointments}
									/>
		{/if}
</main>	

				
<style>
	main {font-family: Verdana, sans-serif;}
</style>