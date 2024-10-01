const baseUrl = 'http://127.0.0.1:5000';

const convertDates = (arrangements) => {
    return arrangements.map(arrangement => {
        return {
            ...arrangement,
            date: new Date(arrangement.date),
        };
    });
};

export const fetchArrangements = async (employeeIds = [], supervisorIds = []) => {
    const params = new URLSearchParams();

    if (employeeIds.length > 0) {
        params.append('eid', employeeIds);
    }

    if (supervisorIds.length > 0) {
        params.append('sid', supervisorIds);
    }

    const response = await fetch(`${baseUrl}/get_arrangements?${params.toString()}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch arrangements');
    }
    
    const data = await response.json();
    console.log(data)
    return convertDates(data.arrangements);
};

export const updateArrangement = async (arrangement) => {
    const response = await fetch(`${baseUrl}/update_arrangement`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(arrangement),
    });
    if (!response.ok) throw new Error('Failed to update arrangement');
    return response.json();
};