import { writable } from 'svelte/store';
import { employeeAPI, scheduleAPI, departmentAPI } from './api';

function createEmployeeStore() {
    const { subscribe, set, update } = writable([]);
    
    return {
        subscribe,
        
        init: () => {
            return employeeAPI.subscribeToEmployees((updatedEmployees) => {
                set(updatedEmployees);
            });
        },
        
        updateEmployeeStatus: async (employeeId, newStatus) => {
            try {
                await employeeAPI.updateEmployeeStatus(employeeId, newStatus);
                
                update(employees => {
                    return employees.map(emp => {
                        if (emp.id === employeeId) {
                            const newHistory = {
                                date: new Date().toISOString().split('T')[0],
                                hours: "9:00 AM - 5:00 PM",
                                status: newStatus
                            };
                            
                            return {
                                ...emp,
                                status: newStatus,
                                scheduleHistory: [newHistory, ...emp.scheduleHistory]
                            };
                        }
                        return emp;
                    });
                });
            } catch (error) {
                console.error('Error updating employee status:', error);
                throw error;
            }
        },
        
        getEmployeeSchedule: async (employeeId) => {
            try {
                return await scheduleAPI.getScheduleHistory(employeeId);
            } catch (error) {
                console.error('Error fetching employee schedule:', error);
                throw error;
            }
        },
        
        addScheduleEntry: async (employeeId, scheduleEntry) => {
            try {
                return await scheduleAPI.addScheduleEntry(employeeId, scheduleEntry);
            } catch (error) {
                console.error('Error adding schedule entry:', error);
                throw error;
            }
        },
        
        setFilters: async (filters) => {
            try {
                const filteredEmployees = await employeeAPI.getFilteredEmployees(filters);
                set(filteredEmployees);
            } catch (error) {
                console.error('Error applying filters:', error);
                throw error;
            }
        },
        
        addEmployee: async (employeeData) => {
            try {
                const newEmployeeId = await employeeAPI.addEmployee(employeeData);
                return newEmployeeId;
            } catch (error) {
                console.error('Error adding employee:', error);
                throw error;
            }
        },
        
        deleteEmployee: async (employeeId) => {
            try {
                await employeeAPI.deleteEmployee(employeeId);
                update(employees => employees.filter(emp => emp.id !== employeeId));
            } catch (error) {
                console.error('Error deleting employee:', error);
                throw error;
            }
        },
        
        updateEmployee: async (employeeId, updates) => {
            try {
                await employeeAPI.updateEmployeeSchedule(employeeId, updates);
                update(employees => {
                    return employees.map(emp => {
                        if (emp.id === employeeId) {
                            return { ...emp, ...updates };
                        }
                        return emp;
                    });
                });
            } catch (error) {
                console.error('Error updating employee:', error);
                throw error;
            }
        },
        
        getAllDepartments: async () => {
            try {
                return await departmentAPI.getAllDepartments();
            } catch (error) {
                console.error('Error fetching departments:', error);
                throw error;
            }
        }
    };
}

export const employeeStore = createEmployeeStore();