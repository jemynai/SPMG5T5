import { writable } from 'svelte/store';
import { fetchUsers, updateUserRole } from '../services/userService';

const userStore = writable([]);

export const loadUsers = async () => {
    try {
        const users = await fetchUsers();
        userStore.set(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
};

export const handleRoleUpdate = async (updatedUser) => {
    try {
        const result = await updateUserRole(updatedUser);
        userStore.update(users => 
            users.map(user => (user.id === result.id ? result : user))
        );
        return true;
    } catch (error) {
        console.error('Error updating user role:', error);
        return false;
    }
};

export default userStore;