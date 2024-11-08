<script>
	import { onMount } from 'svelte'; 
    import Calendar from '@event-calendar/core';
    import DayGrid from '@event-calendar/day-grid';
	import config from './config';

	// event-calendar code
	let current_user = '130002';
	let current_view = 'self';
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

	function updateView(view) {
		current_view = view;
		fetchArrangements()
	}

	function closeModal() {
		document.getElementById('eventModal').style = 'display:none;'
	}

	let arrangementsArray = [];

	async function fetchArrangements() {
		const endpoint = current_view === 'self' 
			? `${config.base_url}/employee_view_own_ttbl?eid=${current_user}`
			: `${config.base_url}/employee_view_team_ttbl?eid=${current_user}`;

		try {
			const response = await fetch(endpoint);
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
			arrangementsArray.sort((a, b) => new Date(a.date) - new Date(b.date));
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
	<h1>Your Timetable</h1>
	<div class="current-view-container">
		<div class="current-view-box {current_view === 'self' ? 'active' : ''}" on:click={() => updateView('self')}>Self</div>
		<div class="current-view-box {current_view === 'team' ? 'active' : ''}" on:click={() => updateView('team')}>Team</div>
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
		text-align: start;
		font-weight: bold;
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

	/* Box styles for current view selection */
	.current-view-container {
		display: flex;
		justify-content: flex-start; /* Distribute space between boxes */
		margin: 20px 0;
		max-width: 200px; /* Set a max width for the container */
	}

	.current-view-box {
		flex: 1;
		padding: 10px;
		border: 1px solid #ccc;
		cursor: pointer;
		text-align: center;
		transition: background-color 0.3s;
	}

	.current-view-box:hover {
		background-color: #f0f0f0;
	}

	.active {
		background-color: #f0f0f0;
	}
</style>