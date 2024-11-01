<script>
    import { onMount } from 'svelte';
    
    // Filter states
    let departments = ['Engineering', 'Marketing', 'HR', 'Finance', 'Sales'];
    let selectedDepartment = 'All';
    let searchQuery = '';
    let selectedStatus = 'All';
    let selectedDateRange = 'today';
    let startDate = new Date().toISOString().split('T')[0];
    let endDate = new Date().toISOString().split('T')[0];
    
    // Modal state
    let showDetailModal = false;
    let selectedEmployee = null;
    let employees = [];
    let loading = true;
    let error = null;
    
    // Fetch employees with optional filters
    async function fetchEmployees(filters = {}) {
    try {
        loading = true;
        const queryParams = new URLSearchParams();
        
        if (filters.department && filters.department !== 'All') {
            queryParams.append('department', filters.department);
        }
        if (filters.status && filters.status !== 'All') {
            queryParams.append('status', filters.status);
        }
        if (filters.search) {
            queryParams.append('search', filters.search);
        }

        const response = await fetch(`/api/employees?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch employees');
        
        const data = await response.json();
        employees = data.employees || [];
    } catch (err) {
        error = 'Failed to load employee data';
        console.error('Error:', err);
    } finally {
        loading = false;
    }
}

    // Update employee status
    async function updateEmployeeStatus(employeeId, newStatus) {
    try {
        const response = await fetch(`/api/employee/${employeeId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) throw new Error('Failed to update status');
        
        await fetchEmployees();
    } catch (error) {
        console.error('Error updating employee status:', error);
    }
}

    // Initialize data
    onMount(() => {
        fetchEmployees();
    });

    // Apply filters when changes occur
    $: {
        if (!loading) {
            fetchEmployees({
                department: selectedDepartment,
                status: selectedStatus,
                search: searchQuery
            });
        }
    }
    
    // Filter employees client-side for date range
    $: filteredEmployees = employees.filter(emp => {
        if (!emp) return false;
        
        // Date range filter
        if (selectedDateRange === 'custom') {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const scheduleDate = new Date(emp.scheduleDate);
            if (scheduleDate < start || scheduleDate > end) {
                return false;
            }
        }
        
        return true;
    });
    
    $: officeEmployees = filteredEmployees.filter(emp => emp.status === 'office');
    $: remoteEmployees = filteredEmployees.filter(emp => emp.status === 'remote');
    
    function getStatusColor(status) {
        return status === 'office' ? 'bg-green-100' : 'bg-blue-100';
    }

    function openEmployeeDetail(employee) {
        selectedEmployee = employee;
        showDetailModal = true;
    }

    function closeEmployeeDetail() {
        showDetailModal = false;
        selectedEmployee = null;
    }
</script>

<main class="container mx-auto p-4">
    {#if loading}
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    {:else if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong class="font-bold">Error!</strong>
            <span class="block sm:inline">{error}</span>
        </div>
    {:else}
        <div class="bg-white shadow-lg rounded-lg p-6">
            <h1 class="text-3xl font-bold mb-6">Staff Schedule Dashboard</h1>
            
            <!-- Advanced Filters Section -->
            <div class="bg-gray-50 p-4 rounded-lg mb-6">
                <h2 class="text-xl font-semibold mb-4">Advanced Filters</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- Search Input -->
                    <div>
                        <label for="search-staff" class="block text-sm font-medium text-gray-700 mb-2">
                            <div class="relative">
                                <input
                                    type="text"
                                    bind:value={searchQuery}
                                    placeholder="Search..."
                                    class="w-full p-2 pl-10 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                                />
                                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </label>
                    </div>

                    <!-- Department Filter -->
                    <div>
                        <label for="department-filter" class="block text-sm font-medium text-gray-700 mb-2">
                            Department
                        </label>
                        <select
                            bind:value={selectedDepartment}
                            class="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All Departments</option>
                            {#each departments as dept}
                                <option value={dept}>{dept}</option>
                            {/each}
                        </select>
                    </div>

                    <!-- Status Filter -->
                    <div>
                        <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-2">
                            Work Status
                        </label>
                        <select
                            bind:value={selectedStatus}
                            class="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="All">All Statuses</option>
                            <option value="office">In Office</option>
                            <option value="remote">Remote</option>
                        </select>
                    </div>

                    <!-- Date Range Filter -->
                    <div>
                        <label for="date-range" class="block text-sm font-medium text-gray-700 mb-2">
                            Date Range
                        </label>
                        <select
                            bind:value={selectedDateRange}
                            class="w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 mb-2"
                        >
                            <option value="today">Today</option>
                            <option value="custom">Custom Range</option>
                        </select>
                        
                        {#if selectedDateRange === 'custom'}
                            <div class="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    bind:value={startDate}
                                    class="p-2 border rounded-md"
                                />
                                <input
                                    type="date"
                                    bind:value={endDate}
                                    class="p-2 border rounded-md"
                                />
                            </div>
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Stats Overview -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 class="text-lg font-semibold text-gray-700">Total Staff</h3>
                    <p class="text-2xl font-bold">{filteredEmployees.length}</p>
                </div>
                <div class="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 class="text-lg font-semibold text-gray-700">In Office</h3>
                    <p class="text-2xl font-bold text-green-600">{officeEmployees.length}</p>
                </div>
                <div class="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 class="text-lg font-semibold text-gray-700">Remote</h3>
                    <p class="text-2xl font-bold text-blue-600">{remoteEmployees.length}</p>
                </div>
            </div>

            <!-- Employee Lists -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- In Office List -->
                <div>
                    <h2 class="text-xl font-semibold mb-3">In Office</h2>
                    <div class="space-y-2">
                        {#if officeEmployees.length === 0}
                            <p class="text-gray-500 italic">No employees found</p>
                        {/if}
                        {#each officeEmployees as employee}
                            <button 
                                type="button"
                                class="w-full text-left flex items-center p-3 {getStatusColor(employee.status)} rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                on:click={() => openEmployeeDetail(employee)}
                                on:keydown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        openEmployeeDetail(employee);
                                    }
                                }}
                            >
                                <div>
                                    <p class="font-semibold">{employee.name}</p>
                                    <p class="text-sm text-gray-600">ID: {employee.id} • {employee.department}</p>
                                </div>
                            </button>
                        {/each}
                    </div>
                </div>

                <!-- Remote List -->
                <div>
                    <h2 class="text-xl font-semibold mb-3">Remote</h2>
                    <div class="space-y-2">
                        {#if remoteEmployees.length === 0}
                            <p class="text-gray-500 italic">No employees found</p>
                        {/if}
                        {#each remoteEmployees as employee}
                            <button 
                                type="button"
                                class="w-full text-left flex items-center p-3 {getStatusColor(employee.status)} rounded-lg cursor-pointer hover:shadow-md transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                on:click={() => openEmployeeDetail(employee)}
                                on:keydown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        openEmployeeDetail(employee);
                                    }
                                }}
                            >
                                <div>
                                    <p class="font-semibold">{employee.name}</p>
                                    <p class="text-sm text-gray-600">ID: {employee.id} • {employee.department}</p>
                                </div>
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
        </div>

        <!-- Employee Detail Modal -->
        {#if showDetailModal && selectedEmployee}
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-start mb-4">
                            <h2 class="text-2xl font-bold">{selectedEmployee.name}</h2>
                            <button 
                                class="text-gray-500 hover:text-gray-700"
                                on:click={closeEmployeeDetail}
                            >
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p class="text-sm text-gray-600">Employee ID</p>
                                <p class="font-medium">{selectedEmployee.id}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Department</p>
                                <p class="font-medium">{selectedEmployee.department}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Team</p>
                                <p class="font-medium">{selectedEmployee.team}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Manager</p>
                                <p class="font-medium">{selectedEmployee.manager}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Email</p>
                                <p class="font-medium">{selectedEmployee.email}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Phone</p>
                                <p class="font-medium">{selectedEmployee.phone}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Join Date</p>
                                <p class="font-medium">{selectedEmployee.joinDate}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-600">Current Status</p>
                                <p class="font-medium capitalize">{selectedEmployee.status}</p>
                            </div>
                        </div>

                        <div class="border-t pt-4">
                            <h3 class="font-semibold mb-3">Schedule History</h3>
                            <div class="space-y-2">
                                {#each selectedEmployee.scheduleHistory as schedule}
                                    <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <div>
                                            <p class="font-medium">{schedule.date}</p>
                                            <p class="text-sm text-gray-600">{schedule.hours}</p>
                                        </div>
                                        <span class="capitalize px-3 py-1 rounded-full text-sm {
                                            schedule.status === 'office' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-blue-100 text-blue-800'
                                        }">
                                            {schedule.status}
                                        </span>
                                    </div>
                                {/each}
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="mt-6 flex justify-end space-x-3">
                            <button
                                class="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-md border hover:bg-gray-50"
                                on:click={closeEmployeeDetail}
                            >
                                Close
                            </button>
                            <button
                                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                on:click={() => updateEmployeeStatus(
                                    selectedEmployee.id,
                                    selectedEmployee.status === 'office' ? 'remote' : 'office'
                                )}
                            >
                                Toggle Status
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    {/if}
</main>