<script>
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	export let requests = []; // Array to hold work-from-home requests
	export let staffSchedule = []; // Array to hold staff schedules

	let requestDetails = {
		staffName: "", // Name of the staff member
		date: "", // Date of the request
		location: "", // "Home" or "Office"
		status: "pending" // Status of the request
	}

	const submitRequest = () => {
		dispatch('addRequest', requestDetails);
		// Reset to empty values
		requestDetails = {
			staffName: "",
			date: "",
			location: "",
			status: "pending"
		}
	}
</script>

<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css">

<section transition:fade={{ duration: 125 }}>
	<form method="post" on:submit|preventDefault={submitRequest}>
		<div id="closer-cont">
			<span on:click={() => dispatch('modalClose')} class="close" title="Close Modal">&times;</span>
		</div>

		<header>
			<h2>Request Work-from-Home</h2>
			<input type="text" 
						 required
						 placeholder="Your Name"
						 bind:value={requestDetails.staffName}>
			
			<input type="date" 
						 required
						 bind:value={requestDetails.date}>
			
			<div id="location-cont">
				<label for="location">Location:</label>
				<select id="location" bind:value={requestDetails.location} required>
					<option value="" disabled>Select location</option>
					<option value="home">Home</option>
					<option value="office">Office</option>
				</select>
			</div>
			
			<div>
				<button class="addBtn">Submit Request</button>
			</div>	
		</header>
	</form>

	<table id="requests-cont">
		{#if requests.length === 0}
			<h1>No requests submitted</h1>
		{:else}
			{#each requests as request}
				<tr>
					<td>{request.staffName}</td>
					<td>{request.date}</td>
					<td>{request.location}</td>
					<td>{request.status}</td>
				</tr>
			{/each}
		{/if}
	</table>
</section>

<style>
	/* Add your styles here */
	section {
		box-sizing: border-box;
		width: 100%;
		height: 100vh;
		position: absolute;
		left: 0;
		top: 0;
		background-color: white;
	}
	
	.close {
		position: absolute;
		font-size: 2rem;
		color: white;
		right: 0;
		top: 0;
		padding: 8px 16px;
		cursor: pointer;
	}

	header {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: hsl(33, 92%, 29%);
		padding: 30px 40px;
		color: white;
	}

	input, select {
		margin: 10px 0;
		padding: 10px;
		width: 300px;
		font-size: 1.1rem;
	}
	
	.addBtn {
		padding: 10px;
		background: hsl(168, 76%, 40%);
		color: #FFF;
		cursor: pointer;
		transition: 0.1s;
		border: 1px solid hsl(168, 76%, 40%);
	}
	
	.addBtn:hover {
		background-color: hsl(168, 76%, 35%);
	}	

	.requests-cont {
		margin-top: 20px;
		width: 100%;
		border-collapse: collapse;
	}

	.requests-cont tr {
		border: 1px solid #ddd;
	}
</style>
