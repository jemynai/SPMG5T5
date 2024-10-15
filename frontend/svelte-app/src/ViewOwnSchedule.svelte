<script>
	import { onMount } from 'svelte'; 
    import Calendar from '@event-calendar/core';
    import DayGrid from '@event-calendar/day-grid';
	// event-calendar code
	let current_user = '130002'
	console.log(current_user)
	let plugins = [DayGrid];
    let options = {
        events: []
	};
	let arrangementsArray = [];
	// let arrangementsArray = [];

	// hardcoded example data, replace with Firebase data when I figure out how 
	// let arrangements = {
	// 	'2ayHkqtidVyAylFq9a45':
	// 	{
	// 		created_at: '19 September 2024 at 22:01:16 UTC+8',
	// 		date: '24 September 2024 at 08:00:00 UTC+8',
	// 		employee_id: "130002",
	// 		notes: null,
	// 		shift: "pm",
	// 		status: "pending",
	// 		supervisors: ['1']
	// 	},
	// 	'IHWIRbpeg5v4pbfhCx47': 
	// 	{
	// 		created_at: '19 September 2024 at 22:01:13 UTC+8',
	// 		date: '23 September 2024 at 08:00:00 UTC+8',
	// 		employee_id: "130002",
	// 		notes: null,
	// 		shift: "pm",
	// 		status: "pending",
	// 		supervisors: ['1']
	// 	},
	// 	cSUg8b3bctSYToO2ej41:
	// 	{
	// 		created_at: '19 September 2024 at 22:01:23 UTC+8',
	// 		date: '24 September 2024 at 08:00:00 UTC+8',
	// 		employee_id: "130010",
	// 		notes: null,
	// 		shift: "pm",
	// 		status: "pending",
	// 		supervisors: ['1']
	// 	}
	// };

	async function fetchArrangements() {
    	try {
      		const response = await fetch(`http://localhost:8000/employee_view_own_ttbl?eid=${current_user}`);
      		if (!response.ok) {
        		throw new Error('Failed to fetch data');
      		}
      	const data = await response.json();

		// Reset arrays before pushing new data
		arrangementsArray = [];
		options.events = [];

		arrangementsArray.push(...data.arrangements);
		for (let a of arrangementsArray) {
			let arrangementDate = new Date(Date.parse(a.date));
			options.events.push({
				title: a.employee_id + ": " + a.shift.toUpperCase() + " WFH",
				start: arrangementDate,
				end: arrangementDate,
				allDay: true
			});
		}
			arrangementsArray = [...arrangementsArray];
			options.events = [...options.events];
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	}

	onMount(() => {
    	fetchArrangements();
  	});

	// function populateCalendar (arrangements) {
	// let arrangementsArray = Object.values(arrangements)
	// for (let arrangement of arrangementsArray) {
	// 	let arrangementDate = new Date(Date.parse(arrangement.date))
	// 	options.events.push(
	// 		{
	// 			title: arrangement.employee_id + ": " + arrangement.shift.toUpperCase() + " WFH",
	// 			start: arrangementDate,
	// 			end: arrangementDate,
	// 			allDay: true
	// 		},
	// 	)
	// }

	function formatDate(date) {
    // Get the day, month and year from the date string
		let dateObj = new Date(Date.parse(date))
		let day = dateObj.getDate(); // Gets the day of the month (1-31)
		let month = dateObj.getMonth() + 1; // Gets the month (0-11) and add 1 to make it (1-12)
		let year = dateObj.getFullYear(); // Gets the full year (e.g., 2024)
		// Format day and month to ensure two digits (e.g., "05" instead of "5")
		if (day < 10) {
			day = '0' + day;
		}
		if (month < 10) {
			month = '0' + month;
		}
		// Return formatted date string
		return `${day}/${month}/${year}`;
	}
</script>

<main>
	<h1>Work From Home Arrangements</h1>
	<div>
		<p>Current user:</p>
		<select id="current_user" on:change="{(event) => {current_user = event.target.value; fetchArrangements();}}">
			<option value="130002">130002</option>
			<option value="130010">130010</option>
		</select>
	</div>
	<Calendar {plugins} {options} />
	<ul>
		{#each arrangementsArray as arrangement}
			<li>
				<b>{formatDate(arrangement.date)}</b><br>
				Employee No. {arrangement.employee_id}: {arrangement.shift.toUpperCase()} WFH
			</li>
		{/each}
	</ul>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	li {
		list-style-type: none;
		border: solid 1px grey;
		padding: 5px;
		margin: 5px
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>