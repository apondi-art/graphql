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
          object: {
          type: {_eq: "project" }
          }
        },
        order_by: { createdAt: asc }
      ) {
        amount
        createdAt
        path
        objectId
        object{
        type
        name
        }
      }
    }
  `;

  const variables = { userId };
  const data = await fetchGraphQL(query, variables);
  const xpTransactions = data.transaction;
  return xpTransactions


}

// ✅ Get audit ratio for the current user
// ✅ Get audit ratio for the current user (projects only, done/received)
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
          userId: { _eq: $userId },
          object: {
            type: { _eq: "project" }
          }
        }
      ) {
        aggregate {
          sum {
            amount
          }
        }
      }
      down: transaction_aggregate(
        where: {
          type: { _eq: "down" },
          userId: { _eq: $userId },
          object: {
            type: { _eq: "project" }
          }
        }
      ) {
        aggregate {
          sum {
            amount
          }
        }
      }
    }
  `;

  const variables = { userId };
  const data = await fetchGraphQL(query, variables);

  const upAmount = data.up.aggregate.sum.amount || 0;
  const downAmount = data.down.aggregate.sum.amount || 0;

  // Calculate ratio: audits given / audits received
  const ratio = downAmount > 0 ? upAmount / downAmount : upAmount > 0 ? Infinity : 0;

  return {
    up: upAmount,
    down: downAmount,
    ratio: parseFloat(ratio.toFixed(1))
  };
}


// ✅ Get project grades for the current user
export async function getProjectGrades() {
  const token = getToken();
  if (!token) throw new Error("You are not logged in. Please log in to continue");

  const payload = decodeJWT(token);
  const userId = parseInt(payload.sub);

  const query = `
    query($userId: Int!) {
      progress(
        where: {
          userId: { _eq: $userId },
          grade: { _gte: 0 }
        },
        order_by: { createdAt: asc }
      ) {
        grade
        createdAt
        object {
          id
          name
          type
        }
      }
    }
  `;

  const variables = { userId };
  const data = await fetchGraphQL(query, variables);

  // Filter only where object.type === "project"
  const onlyProjects = data.progress.filter(entry => entry.object?.type === "project");

  return onlyProjects;
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

export function formatXP(bytes) {
  if (bytes >= 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  } else if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + ' kB';
  } else {
    return bytes + ' B';
  }
}


// 🔧 Updated function to fetch only completed project XP
export async function getCompletedProjectXP() {
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
          userId: { _eq: $userId },
          object: {
            type: { _eq: "project" }
          }
        },
        order_by: { createdAt: asc }
      ) {
        amount
        createdAt
        path
        objectId
        object {
          type
          name
        }
      }
    }
  `;

  const variables = { userId };
  const data = await fetchGraphQL(query, variables);

  const excludedPaths = [
    "/kisumu/module/piscine-ui/",
    "/kisumu/module/piscine-ux/"
  ];

  const completedProjects = data.transaction
    .filter(transaction => {
      const isExcluded = excludedPaths.some(prefix => transaction.path?.startsWith(prefix));
      return !isExcluded && transaction.object?.type === 'project' && transaction.amount > 0;
    })
    .sort((a, b) => b.amount - a.amount); // 🔽 Sort by XP descending

  return completedProjects;
}

