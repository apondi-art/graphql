
// auth.js - Debug version with better error handling

//stores token in browser's local storage under 'jwtToken'
function storeToken(token) {
    if (!token) {
        console.error('Attempted to store undefined/null token');
        return;
    }
    localStorage.setItem('jwtToken', token);
    console.log('Token stored successfully');
}

//retrieve JWT token
function getToken() {
    const token = localStorage.getItem('jwtToken');
    console.log('Retrieved token:', token ? 'Token exists' : 'No token found');
    return token;
}

//Remove token on logout
function clearToken() {
    localStorage.removeItem('jwtToken');
    console.log('Token cleared');
}

//Authentication user with username/email and password
async function authenticateUser(identifier, password) {
    console.log('Attempting authentication for:', identifier);

    try {
        //encode credential for basic authentication
        const authString = btoa(`${identifier}:${password}`);
        console.log('Auth string created');

        const response = await fetch('https://learn.zone01kisumu.ke/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            // Get more details about the error
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.text();
                console.log('Error response body:', errorData);
                errorMessage += ` - ${errorData}`;
            } catch (e) {
                console.log('Could not read error response body');
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Response data:', data);

        // The API returns the JWT token directly as a string
        if (!data || typeof data !== 'string' || data.length === 0) {
            console.error('No JWT in response:', data);
            throw new Error('Authentication successful but no JWT token received');
        }


        console.log('JWT received successfully');
        return data.trim();

    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}

// Decode JWT to get user info
function decodeJWT(token) {
    if (!token || typeof token !== 'string') {
        console.error('Invalid token: Not a string or empty');
        return null;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        console.error('Invalid JWT structure: Token must have 3 parts, got:', parts.length);
        console.error('Token:', token);
        return null;
    }

    try {
        // Fix base64url padding for proper decoding
        const base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const paddedPayload = base64Payload + '='.repeat((4 - base64Payload.length % 4) % 4);

        const payload = JSON.parse(atob(paddedPayload));
        console.log('JWT decoded successfully:', payload);
        return payload;
    } catch (err) {
        console.error('Failed to decode JWT:', err);
        return null;
    }
}

//check if user is authenticated
function isAuthenticated() {
    const token = getToken();
    if (!token) {
        console.log('No token found - user not authenticated');
        return false;
    }

    const payload = decodeJWT(token);
    if (!payload) {
        console.log('Invalid token - user not authenticated');
        return false;
    }

    // checks if token is expired 
    const isValid = payload.exp * 1000 > Date.now();
    console.log('Token valid:', isValid);
    if (!isValid) {
        console.log('Token expired at:', new Date(payload.exp * 1000));
    }

    return isValid;
}

export {
    storeToken, getToken, clearToken, authenticateUser, decodeJWT, isAuthenticated
}