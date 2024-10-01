import { writable } from 'svelte/store';
import { fetchArrangements, updateArrangement } from './services/arrangementService';

const arrangementStore = writable([]);

export const loadArrangements = async (employeeIds = [], supervisorIds = []) => {
    try {
        const arrangements = await fetchArrangements(employeeIds, supervisorIds);
        arrangementStore.set(arrangements);
    } catch (error) {
        console.error('Error loading arrangements:', error);
    }
};

export const handleUpdate = async (updatedArrangement) => {
    try {
        const result = await updateArrangement(updatedArrangement);
        arrangementStore.update(arrangements => 
            arrangements.map(arrangement => (arrangement.id === result.id ? result : arrangement))
        );
        return true;
    } catch (error) {
        console.error('Error updating arrangement:', error);
        return false;
    }
};

export default arrangementStore;