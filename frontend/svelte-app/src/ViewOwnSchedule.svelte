<script>
	import { onMount } from 'svelte'; 
    import Calendar from '@event-calendar/core';
    import DayGrid from '@event-calendar/day-grid';
	// event-calendar code
	let current_user = '130002'
	let plugins = [DayGrid];
    let options = {
        events: [],
		eventClick: function(info) {
			// Populate modal with event details
			document.getElementById('modalEventTitle').innerText = formatDate(info.event.start)
			document.getElementById('modalEventDetails').innerText = info.event.title.slice(-6) + " for employee no. " + info.event.title.slice(0,6)
			// Display the modal
			document.getElementById('eventModal').style.display = 'block';
    	},
	};
	function closeModal() {
		document.getElementById('eventModal').style = 'display:none;'
	}
	let arrangementsArray = [];

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

	function formatDate(date) {
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
	<div id="eventModal" class="modal" style="display:none;">
		<div class="modal-content">
			<span class="close-button" on:click="{closeModal}">&times;</span>
			<h2><span id="modalEventTitle"></span></h2>
			<p id="modalEventDetails"></p>
		</div>
	</div>
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

	.modal {
		display: none; /* Hidden by default */
		position: fixed; /* Stay in place */
		z-index: 1; /* Sit on top */
		left: 0;
		top: 0;
		width: 100%; /* Full width */
		height: 100%; /* Full height */
		overflow: auto; /* Enable scroll if needed */
		background-color: rgb(0,0,0); /* Fallback color */
		background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
	}

	.modal-content {
		background-color: #fefefe;
		margin: 15% auto; /* 15% from the top and centered */
		padding: 20px;
		border: 1px solid #888;
		width: 80%; /* Could be more or less, depending on screen size */
	}

	.close-button {
		color: #aaa;
		float: right;
		font-size: 28px;
		font-weight: bold;
	}

	.close-button:hover,
	.close-button:focus {
		color: black;
		text-decoration: none;
		cursor: pointer;
	}
</style>