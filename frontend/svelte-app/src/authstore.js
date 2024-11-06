import { writable } from 'svelte/store';

const jwtToken = writable(localStorage.getItem('jwt') || '');
const userClaims = writable({});

// Function to decode the JWT and extract claims
function decodeJWT(token) {
    if (!token) return {};

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
            .join('')
    );

    return JSON.parse(jsonPayload);
}

// Initialize claims if token exists
userClaims.set(decodeJWT(localStorage.getItem('jwt')) || {});

// Subscribe to jwtToken updates to store it and update claims
jwtToken.subscribe((token) => {
    if (token) {
        localStorage.setItem('jwt', token);
        userClaims.set(decodeJWT(token)); // Update claims
        console.log("Token added");
        console.log(userClaims)
    } else {
        localStorage.removeItem('jwt');
        userClaims.set({});
        console.log("Token removed");
    }
});

export { jwtToken, userClaims };
