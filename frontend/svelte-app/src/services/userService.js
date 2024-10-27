const baseUrl = 'http://127.0.0.1:5000';

export const fetchUsers = async () => {
    const response = await fetch(`${baseUrl}/get_users`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    
    const data = await response.json();
    console.log(data)
    return data.users;
};

export const updateUserRole = async (user) => {
    const response = await fetch(`${baseUrl}/update_user_role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
    });
    if (!response.ok) throw new Error('Failed to update user role');
    return response.json();
};