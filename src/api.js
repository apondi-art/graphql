import { getToken, decodeJWT } from './auth.js';

// Base GraphQL fetch function
async function fetchGraphQL(query, variables = {}) {
  const token = getToken();

  try {
    const response = await fetch('https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data;
  } catch (error) {
    console.error('GraphQL query error:', error);
    throw error;
  }
}

// ✅ Get info for the currently logged-in user
export async function getUserInfo() {
  const token = getToken();
  if (!token) throw new Error("You are not logged in. Please log in to continue");

  const payload = decodeJWT(token); // this gives you the user's login
  if (!payload?.sub) throw new Error("Failed to read user info from token. Please log in again");
  
  const userId = parseInt(payload.sub);

  const query = `
    query($userId: Int!) {
      user(where: { id: { _eq: $userId } }) {
        id
        login
        email
        createdAt
      }
    }
  `;

  const variables = { userId };
  const data = await fetchGraphQL(query, variables);

  if (!data.user || data.user.length === 0) {
    throw new Error("User not found");
  }

  // Return the first match 
  return data.user[0];
}

// ✅ Get XP transactions for the current user
export async function getXpTransactions() {
    const token = getToken();
    if (!token) throw new Error("You are not logged in. Please log in to continue");
    
    const payload = decodeJWT(token);
    if (!payload?.sub) throw new Error("Failed to read user info from token. Please log in again");
    
    const userId = parseInt(payload.sub);

    const query = `
    query($userId: Int!) {
      transaction(
        where: {
          type: { _eq: "xp" },
          userId: { _eq: $userId }
        },
        order_by: { createdAt: asc }
      ) {
        amount
        createdAt
        path
        objectId
      }
    }
  `;

    const variables = { userId };
    const data = await fetchGraphQL(query, variables);
    return data.transaction;
}

// ✅ Get audit ratio for the current user
export async function getAuditRatio() {
    const token = getToken();
    if (!token) throw new Error("You are not logged in. Please log in to continue");
    
    const payload = decodeJWT(token);
    if (!payload?.sub) throw new Error("Failed to read user info from token. Please log in again");
    
    const userId = parseInt(payload.sub);

    const query = `
    query($userId: Int!) {
      up: transaction_aggregate(
        where: {
          type: { _eq: "up" },
          userId: { _eq: $userId }
        }
      ) {
        aggregate {
          count
        }
      }
      down: transaction_aggregate(
        where: {
          type: { _eq: "down" },
          userId: { _eq: $userId }
        }
      ) {
        aggregate {
          count
        }
      }
    }
  `;

    const variables = { userId };
    const data = await fetchGraphQL(query, variables);

    return {
        up: data.up.aggregate.count,
        down: data.down.aggregate.count
    };
}

// ✅ Get project grades for the current user
export async function getProjectGrades() {
    const token = getToken();
    if (!token) throw new Error("You are not logged in. Please log in to continue");
    
    const payload = decodeJWT(token);
    if (!payload?.sub) throw new Error("Failed to read user info from token. Please log in again");
    
    const userId = parseInt(payload.sub);

    const query = `
    query($userId: Int!) {
      result(
        where: {
          _and: [
            { type: { _eq: "project" } },
            { grade: { _gte: 0 } },
            { userId: { _eq: $userId } }
          ]
        },
        order_by: { createdAt: asc }
      ) {
        grade
        createdAt
        objectId
      }
    }
  `;

    const variables = { userId };
    const data = await fetchGraphQL(query, variables);
    return data.result;
}

// ✅ Get object names for projects/exercises (this is already general)
export async function getObjectName(objectId) {
    const query = `
    query GetObjectName($objectId: Int!) {
      object(where: { id: { _eq: $objectId } }) {
        name
        type
      }
    }
  `;

    const data = await fetchGraphQL(query, { objectId });
    return data.object[0];
}
