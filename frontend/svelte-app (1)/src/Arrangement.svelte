<script>
    import { handleUpdate } from './arrangementStore';

    export let arrangement;
    let isEditing = false;
    let editedArrangement = { ...arrangement };
    let dateString = editedArrangement.date.toISOString().split('T')[0];
    const parseDate = (dateString) => new Date(dateString);

    const handleEditToggle = async () => {
        if (isEditing) {
            editedArrangement.date = parseDate(dateString);
            if (await handleUpdate(editedArrangement)) arrangement = editedArrangement;
        }
        isEditing = !isEditing;
    };
</script>

{#if isEditing}
        <!-- Editable Form -->
        <h3>Edit Arrangement</h3>
        <h4>{arrangement.id}</h4>
        <input type="date" bind:value={dateString} />
        <label><input type="radio" bind:group={editedArrangement.shift} value="am" />AM</label>
        <label><input type="radio" bind:group={editedArrangement.shift} value="pm" />PM</label>
        <textarea bind:value={editedArrangement.notes} placeholder="Details"></textarea>
        <button on:click={handleEditToggle}>Save</button>
    {:else}
        <!-- Display Mode -->
        <h3>{arrangement.id}</h3>
        <p>Date: {arrangement.date.toLocaleDateString()} - {arrangement.shift}</p>
        {#if arrangement.notes}
            <p>Details: {arrangement.notes}</p>
        {/if}
        <button on:click={handleEditToggle}>Edit</button> <!-- Toggle to edit mode -->
    {/if}