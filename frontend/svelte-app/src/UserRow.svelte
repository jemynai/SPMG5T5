<script>
    import { handleRoleUpdate } from './stores/userStore';

    export let user;
    let isEditing = false;
    let editedUser = { ...user };

    let userRoles = {
        2: 'Employee',
        3: 'Manager',
        1: 'HR',
    };

    const handleEditToggle = async () => {
        if (isEditing) {
            if (await handleRoleUpdate(editedUser)) user = editedUser;
        }
        isEditing = !isEditing;
    };
</script>

{#if isEditing}
    <tr>
        <td>{user.id}</td>
        <td>{user.country}</td>
        <td>{user.dept}</td>
        <td>{user.email}</td>
        <td>{user.first_name}</td>
        <td>{user.last_name}</td>
        <td>{user.position}</td>
        <td>
            <select bind:value={editedUser.role}>
                <option value="2">Employee</option>
                <option value="3">Manager</option>
                <option value="1">HR</option>
            </select>
        </td>
        <td>{user.rpt_manager}</td>
        <td><button on:click={handleEditToggle}>Save</button></td>
    </tr>
{:else}
    <tr>
        <td>{user.id}</td>
        <td>{user.country}</td>
        <td>{user.dept}</td>
        <td>{user.email}</td>
        <td>{user.first_name}</td>
        <td>{user.last_name}</td>
        <td>{user.position}</td>
        <td>{userRoles[user.role]}</td>
        <td>{user.rpt_manager}</td>
        <td><button on:click={handleEditToggle}>Edit</button></td>
    </tr>
{/if}