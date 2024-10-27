<script>
    import { onMount } from 'svelte';
    import userStore, { loadUsers } from './stores/userStore';
    import UserRow from './UserRow.svelte';
    
    let users = [];
    const unsubscribe = userStore.subscribe(value => {
        users = value;
    });

    onMount(() => {
        loadUsers();
    });
</script>
<table>
    <thead>
        <tr>
            <th>ID</th>
            <th>Country</th>
            <th>Department</th>
            <th>Email</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Position</th>
            <th>Role</th>
            <th>Reporting Manager</th>
            <th></th>
        </tr>
        {#each users as user}
            <UserRow {user} />
        {/each}
    </thead>
</table>