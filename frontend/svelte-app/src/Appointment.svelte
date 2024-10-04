<script>
	import scheduleStore from './schedule-store';
	
	export let apptName, time, completed;
	export let apptID, dateID;
	
	
	const deleteAppt = () => {
		scheduleStore.update(currDataState => {
			currDataState[dateID] = currDataState[dateID].filter(appt => appt.id !== apptID)
			return currDataState;
		})
	}
	
	const updateAppt = (e, key) => {
		let newValue = e.target.nodeName === "TD" ? e.target.textContent
		: e.target.checked
		
		scheduleStore.update(currDataState => {
			let i = currDataState[dateID].findIndex(appt => appt.id === apptID);
			currDataState[dateID][i][key] = newValue;
			return currDataState;
		})
	}
</script>


<tr class:completed>
	<td>
		<input type="checkbox" 
					 bind:checked={completed}
					 on:change={(e) => updateAppt(e, "completed")} />
	</td>
	<td contenteditable
			on:blur={(e) => updateAppt(e, "eventname")}>{apptName}</td>
	<td contenteditable
			on:blur={(e) => updateAppt(e, "time")}>{time}</td>
	<td>
		<i class="fa fa-trash-o fa-2x"
			 on:click={deleteAppt}></i>
	</td>	
</tr>


<style>
	td {
		text-align: left;
		padding: 6px;		
	}
	
	td,
	input {
		cursor: pointer
	}
	
	tr:nth-child(even) {
		background-color: #f2f2f2;
	}
	
	input[type="checkbox"] {
		width: 55px;
		height: 25px;
		margin-top: 10px;
	}

	input[type=checkbox]:checked {
		background-color: hsl(168, 76%, 100%);
		color: white;
	}
	
	.completed {
		text-decoration: line-through;
		color: #aaa;
	}	
</style>