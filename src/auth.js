//stores token in browse's local storage under 'jwtToken'
function storeToken(token) {
    localStorage.setItem('jwtToken', token);
}

//retrieve JWT token
function getToken() {
    return localStorage.getItem('jwtToken');
}

//Remove token on logout
function clearToken() {
    return localStorage.removeItem('jwtToken')
}

//Authentication user with username/email and password
async function authenticateUser(identifier, password) {
    try {
        //encode credential for basic authentication
        const authString = btoa(`${identifier}:${password}`);
        const response = await fetch('https://learn.zone01kisumu.ke/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic${authString}`,
                'Content-Type': 'application/json'

            }
        });
        if (!response.ok) {
            throw new Error('Invalid credentials. Please try again.');
        }
        const data = await response.json();
        return data.jwt;
    } catch (error) {
        console.error('Authentication error:', error);
        throw error;
    }
}



// Decode JWT to get user info
function decodeJWT(token) {
  try {
    const payload = atob(token.split('.')[1]); // decode the middle part
    return JSON.parse(payload); // convert string to object
  } catch (err) {
    console.error('Invalid token:', err);
    return null;
  }
}

//check if user is authenticated

function isAuthenticated(){
    const token = getToken();
    if (!token){
        return false;
    }
    const payload = decodeJWT(token)
    // checks if token is expired 
    return payload.exp * 1000 > Date.now();
}

export{
    storeToken, getToken,clearToken,authenticateUser,decodeJWT,isAuthenticated
}
