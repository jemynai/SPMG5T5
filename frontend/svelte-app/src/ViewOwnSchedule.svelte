<script>
	import { onMount } from 'svelte'; 
    import Calendar from '@event-calendar/core';
    import DayGrid from '@event-calendar/day-grid';
	
	let current_user = '130002';
	let current_view = 'self';
	let plugins = [DayGrid];
    let options = {
        events: [],
		eventClick: function(info) {
			showEventDetails(info);
    	},
	};

	function showEventDetails(info) {
		// Populate modal with event details
		document.getElementById('modalEventTitle').innerText = formatDate(info.event.start);
		document.getElementById('modalEventDetails').innerText = info.event.title.slice(-6) + " for employee no. " + info.event.title.slice(0,6);
		// Display the modal
		const modal = document.getElementById('eventModal');
		modal.style.display = 'block';
		// Focus the close button for keyboard navigation
		document.querySelector('.close-button').focus();
	}

	function updateView(view) {
		current_view = view;
		console.log(current_view);
		fetchArrangements();
	}

	function handleViewKeyDown(event, view) {
		// Handle Enter or Space key
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			updateView(view);
		}
	}

	function closeModal(event) {
		// Close on click, Enter, Space, or Escape
		if (!event.key || event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
			document.getElementById('eventModal').style.display = 'none';
		}
	}

	let arrangementsArray = [];

	async function fetchArrangements() {
		const endpoint = current_view === 'self' 
			? `http://localhost:8000/employee_view_own_ttbl?eid=${current_user}`
			: `http://localhost:8000/employee_view_team_ttbl?eid=${current_user}`;

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
			options.events = [...options.events];
		} catch (error) {
			console.error('Error fetching data:', error);
		}
	}

	onMount(() => {
    	fetchArrangements();
		// Add event listener for Escape key
		window.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				closeModal(e);
			}
		});
  	});

	function formatDate(date) {
		let dateObj = new Date(Date.parse(date));
		let day = dateObj.getDate().toString().padStart(2, '0');
		let month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
		let year = dateObj.getFullYear();
		return `${day}/${month}/${year}`;
	}
</script>

<main>
	<h1>Work From Home Arrangements</h1>
	<div>
		<label for="current_user">Current user:</label>
		<select 
			id="current_user" 
			on:change="{(event) => {
				current_user = event.target.value; 
				fetchArrangements();
			}}"
			aria-label="Select current user"
		>
			<option value="130002">130002</option>
			<option value="130010">130010</option>
		</select>
	</div>
	<div class="current-view-container" role="tablist">
		<button
			class="current-view-box {current_view === 'self' ? 'active' : ''}"
			role="tab"
			aria-selected="{current_view === 'self'}"
			on:click={() => updateView('self')}
			on:keydown={(e) => handleViewKeyDown(e, 'self')}
		>
			Self
		</button>
		<button
			class="current-view-box {current_view === 'team' ? 'active' : ''}"
			role="tab"
			aria-selected="{current_view === 'team'}"
			on:click={() => updateView('team')}
			on:keydown={(e) => handleViewKeyDown(e, 'team')}
		>
			Team
		</button>
	</div>
	<Calendar {plugins} {options} />
	<ul aria-label="Work from home arrangements list">
		{#each arrangementsArray as arrangement}
			<li>
				<b>{formatDate(arrangement.date)}</b><br>
				Employee No. {arrangement.employee_id}: {arrangement.shift.toUpperCase()} WFH
			</li>
		{/each}
	</ul>
	<div 
		id="eventModal" 
		class="modal" 
		style="display:none;" 
		role="dialog" 
		aria-labelledby="modalEventTitle"
	>
		<div class="modal-content">
			<button 
				class="close-button" 
				on:click={closeModal}
				on:keydown={closeModal}
				aria-label="Close modal"
			>
				&times;
			</button>
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
		display: none;
		position: fixed;
		z-index: 1;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		overflow: auto;
		background-color: rgba(0,0,0,0.4);
	}

	.modal-content {
		background-color: #fefefe;
		margin: 15% auto;
		padding: 20px;
		border: 1px solid #888;
		width: 80%;
		position: relative;
	}

	.close-button {
		position: absolute;
		right: 10px;
		top: 5px;
		color: #aaa;
		font-size: 28px;
		font-weight: bold;
		border: none;
		background: none;
		cursor: pointer;
		padding: 0 8px;
	}

	.close-button:hover,
	.close-button:focus {
		color: black;
		text-decoration: none;
	}

	.current-view-container {
		display: flex;
		justify-content: flex-start;
		margin: 20px 0;
		max-width: 200px;
	}

	.current-view-box {
		flex: 1;
		padding: 10px;
		border: 1px solid #ccc;
		cursor: pointer;
		text-align: center;
		transition: background-color 0.3s;
		background: none;
	}

	.current-view-box:hover,
	.current-view-box:focus {
		background-color: #f0f0f0;
		outline: 2px solid #ff3e00;
	}

	.active {
		background-color: #f0f0f0;
	}
</style>