import { writable } from 'svelte/store';
import { 
    collection, 
    getDocs, 
    doc, 
    updateDoc, 
    query, 
    where,
    onSnapshot,
    addDoc,
    deleteDoc,
    Timestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Stores
export const employees = writable([]);
export const arrangements = writable([]);

// Employee store functions
export const employeeStore = {
    subscribe: employees.subscribe,
    
    init: () => {
        return employeeAPI.subscribeToEmployees((updatedEmployees) => {
            employees.set(updatedEmployees);
        });
    },

    filterEmployees: async (filters) => {
        const filteredData = await employeeAPI.getFilteredEmployees(filters);
        employees.set(filteredData);
    }
};

// Arrangement functions
export async function fetchArrangements() {
    try {
        const res = await fetch('/api/arrangements');
        const data = await res.json();
        arrangements.set(data.arrangements);
    } catch (error) {
        console.error('Error fetching arrangements:', error);
        throw error;
    }
}

export async function fetchWithdrawalRequests(arrangementId) {
    try {
        const res = await fetch(`/api/get_withdrawal_requests/${arrangementId}`);
        return await res.json();
    } catch (error) {
        console.error('Error fetching withdrawal requests:', error);
        throw error;
    }
}

export async function requestWithdrawal(arrangementId) {
    try {
        const res = await fetch(`/api/request_withdrawal/${arrangementId}`, {
            method: 'POST',
        });
        return await res.json();
    } catch (error) {
        console.error('Error requesting withdrawal:', error);
        throw error;
    }
}

export async function handleWithdrawal(arrangementId, requestId, decision) {
    try {
        const res = await fetch(`/api/handle_withdrawal/${arrangementId}/${requestId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ decision }),
        });
        return await res.json();
    } catch (error) {
        console.error('Error handling withdrawal:', error);
        throw error;
    }
}

// Employee API functions
export const employeeAPI = {
    getAllEmployees: async () => {
        try {
            const employeesRef = collection(db, 'employees');
            const snapshot = await getDocs(employeesRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting employees:', error);
            throw error;
        }
    },

    getEmployeesByDepartment: async (department) => {
        try {
            const employeesRef = collection(db, 'employees');
            const q = query(employeesRef, where('department', '==', department));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting employees by department:', error);
            throw error;
        }
    },

    updateEmployeeStatus: async (employeeId, newStatus) => {
        try {
            const employeeRef = doc(db, 'employees', employeeId);
            await updateDoc(employeeRef, {
                status: newStatus,
                lastUpdated: Timestamp.now()
            });
            return true;
        } catch (error) {
            console.error('Error updating employee status:', error);
            throw error;
        }
    },

    subscribeToEmployees: (callback) => {
        const employeesRef = collection(db, 'employees');
        return onSnapshot(employeesRef, (snapshot) => {
            const employees = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(employees);
        });
    },

    addEmployee: async (employeeData) => {
        try {
            const employeesRef = collection(db, 'employees');
            const docRef = await addDoc(employeesRef, {
                ...employeeData,
                createdAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding employee:', error);
            throw error;
        }
    },

    deleteEmployee: async (employeeId) => {
        try {
            await deleteDoc(doc(db, 'employees', employeeId));
            return true;
        } catch (error) {
            console.error('Error deleting employee:', error);
            throw error;
        }
    },

    updateEmployeeSchedule: async (employeeId, scheduleData) => {
        try {
            const employeeRef = doc(db, 'employees', employeeId);
            await updateDoc(employeeRef, {
                scheduleHistory: [...scheduleData],
                lastScheduleUpdate: Timestamp.now()
            });
            return true;
        } catch (error) {
            console.error('Error updating employee schedule:', error);
            throw error;
        }
    },

    getFilteredEmployees: async (filters) => {
        try {
            let q = collection(db, 'employees');
            
            if (filters.department && filters.department !== 'All') {
                q = query(q, where('department', '==', filters.department));
            }
            if (filters.status && filters.status !== 'All') {
                q = query(q, where('status', '==', filters.status));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting filtered employees:', error);
            throw error;
        }
    }
};

// Schedule API functions
export const scheduleAPI = {
    getScheduleHistory: async (employeeId) => {
        try {
            const employeeRef = doc(db, 'employees', employeeId);
            const snapshot = await getDocs(employeeRef);
            return snapshot.data().scheduleHistory || [];
        } catch (error) {
            console.error('Error getting schedule history:', error);
            throw error;
        }
    },

    addScheduleEntry: async (employeeId, scheduleEntry) => {
        try {
            const employeeRef = doc(db, 'employees', employeeId);
            const currentData = await getDocs(employeeRef);
            const currentHistory = currentData.data().scheduleHistory || [];
            
            await updateDoc(employeeRef, {
                scheduleHistory: [...currentHistory, {
                    ...scheduleEntry,
                    timestamp: Timestamp.now()
                }]
            });
            return true;
        } catch (error) {
            console.error('Error adding schedule entry:', error);
            throw error;
        }
    }
};

// Department API functions
export const departmentAPI = {
    getAllDepartments: async () => {
        try {
            const departmentsRef = collection(db, 'departments');
            const snapshot = await getDocs(departmentsRef);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting departments:', error);
            throw error;
        }
    }
};

// Arrangement API functions
export const arrangementAPI = {
    createArrangement: async (arrangementData) => {
        try {
            const res = await fetch('/api/create_arrangement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(arrangementData),
            });
            return await res.json();
        } catch (error) {
            console.error('Error creating arrangement:', error);
            throw error;
        }
    },

    updateArrangement: async (arrangementId, updateData) => {
        try {
            const res = await fetch(`/api/update_arrangement/${arrangementId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });
            return await res.json();
        } catch (error) {
            console.error('Error updating arrangement:', error);
            throw error;
        }
    },

    deleteArrangement: async (arrangementId) => {
        try {
            const res = await fetch(`/api/delete_arrangement/${arrangementId}`, {
                method: 'DELETE',
            });
            return await res.json();
        } catch (error) {
            console.error('Error deleting arrangement:', error);
            throw error;
        }
    },

    getArrangementsByEmployee: async (employeeId) => {
        try {
            const res = await fetch(`/api/employee_arrangements/${employeeId}`);
            return await res.json();
        } catch (error) {
            console.error('Error fetching employee arrangements:', error);
            throw error;
        }
    },

    getArrangementsByDepartment: async (departmentId) => {
        try {
            const res = await fetch(`/api/department_arrangements/${departmentId}`);
            return await res.json();
        } catch (error) {
            console.error('Error fetching department arrangements:', error);
            throw error;
        }
    }
};