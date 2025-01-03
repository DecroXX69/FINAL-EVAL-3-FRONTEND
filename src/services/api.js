import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
const API_URL = 'https://final-eval-3-backend.onrender.com/api';

// Signup
export const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signup`, userData);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Login
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get workspace by ID
export const getWorkspace = async (workspaceId) => {
  const token = localStorage.getItem('token');
  console.log(token);  // Retrieve the token from localStorage (or cookie)
  console.log(workspaceId);
  if (!token) {
    throw new Error('No token found')}
    const response = await axios.get(`${API_URL}/workspace/${workspaceId}`, {
      headers: {
        'Authorization': `Bearer ${token}`  // Add the token to the request header
      }
    });
    
    return response.data;
};


export const getUserWorkspaces = async (username) => {
  console.log(username);
  const token = localStorage.getItem('token');
  console.log('Token being sent:', token); // Debug log

  try {
    // Include the username as a query parameter or as part of the URL
    const response = await axios.get(`${API_URL}/workspace/${username}/user`, {
       // Use params for query parameters
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Check if the response status is 2xx (success)
    if (response.status >= 200 && response.status < 300) {
      return response.data; // Axios automatically parses JSON response
    } else {
      throw new Error('Failed to fetch workspaces');
    }
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    throw error;
  }
};

// Create a new workspace
export const createWorkspace = async (name) => {
  const response = await axios.post(`${API_URL}/workspace`, { name });
  return response.data;
};



// Add folder to workspace
export const addFolder = async (workspaceId, folderName) => {
  const token = localStorage.getItem('token');
  console.log('Token being sent:', token); // Debug log
  
  const response = await axios.post(
    `${API_URL}/workspace/${workspaceId}/addFolder`,
    { name: folderName }, // Request body
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    } // Request config
  );
  
  return response.data;
};

// Delete folder from workspace
export const deleteFolder = async (workspaceId, folderId) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/workspace/${workspaceId}/folder/${folderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`  // Add the token to the request header
    }
  });
  return response.data;
};

// Add formbot to workspace
export const addFormbot = async (workspaceId, formbotId) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/workspace/${workspaceId}/addFormbot`,  { name: formbotId }, // Request body
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }); // Request config
  return response.data;
};

// Delete formbot from workspace
export const deleteFormbot = async (workspaceId, formbotId) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/workspace/${workspaceId}/formbot/${formbotId}`, {
    headers: {
      'Authorization': `Bearer ${token}`  // Add the token to the request header
    }
  });
  return response.data;
};

// services/api.js
// In api.js, fix the addFormbotToFolder function
export const addFormbotToFolder = async (workspaceId, folderId, formbotName) => {
  const token = localStorage.getItem('token');
  
  const response = await axios.post(
    `${API_URL}/workspace/${workspaceId}/folder/${folderId}/addFormbot`,
    {
      name: formbotName  // Change formbotName to name
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Delete formbot from folder
export const deleteFormbotFromFolder = async (workspaceId, folderId, formbotId) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(
    `${API_URL}/workspace/${workspaceId}/folder/${folderId}/formbot/${formbotId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// Share a workspace by email
export const shareWorkspace = async (workspaceId, email, permissions) => {
  const token = localStorage.getItem('token');
  const username=localStorage.getItem('username');
  console.log(permissions);
  console.log(email);
  if (!token) {
    throw new Error('No token found');
  }

  try {
    const response = await axios.post(
      `${API_URL}/workspace/${workspaceId}/share`,
      {
        email,           // Send email instead of userId
        permissions,
        username     // Send permissions
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,  // Add the token to the request header
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const addSharedWorkspace = async (workspaceId,UserId) => {
  const token = localStorage.getItem('token');
  try {
    console.log('Adding shared workspace:', workspaceId);
    const response = await fetch(`${API_URL}/workspace/${workspaceId}/sharelink`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'UserId': UserId
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add shared workspace');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in addSharedWorkspace:', error);
    throw error;
  }
};

// services/api.js - Add these functions to your existing api.js file

// Function to update user details
export const updateUserDetails = async (userId, updates) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Failed to update user details');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user details:', error);
    throw error;
  }
};

// Function to update password
export const updatePassword = async (userId, oldPassword, newPassword) => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_URL}/users/${userId}/password`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldPassword,
        newPassword
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update password');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

export const getExistingElementIds = async (formbotId) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `${API_URL}/formbot/${formbotId}/elements`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data.map(element => element._id || element.id);
};

export const addFormElements = async (formbotId, elements) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/formbot/${formbotId}/elements`,
    { elements },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Get all form elements for a formbot
export const getFormElements = async (formbotId) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `${API_URL}/formbot/${formbotId}/elements`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Update a form element
export const updateFormElement = async (formbotId, elementId, updates) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(
    `${API_URL}/formbot/${formbotId}/elements/${elementId}`,
    updates,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Delete a form element
export const deleteFormElement = async (formbotId, elementId) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(
    `${API_URL}/formbot/${formbotId}/elements/${elementId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// Reorder form elements
export const reorderFormElements = async (formbotId, elementIds) => {
  if (!Array.isArray(elementIds)) {
    throw new Error('orderedIds must be an array');
  }
  
  const token = localStorage.getItem('token');
  const response = await axios.put(
    `${API_URL}/formbot/${formbotId}/reorder`,
    { elementIds: elementIds },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// services/shareService.js


// Generate a unique share token for the form
const generateShareToken = async (formbotId) => {
  const token = uuidv4();
  return token;
};

// Create a share entry in the database
export const createShareLink = async (formbotId) => {
  try {
    const shareToken = await generateShareToken(formbotId);
    
    const response = await fetch(`${API_URL}/forms/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        formbotId,
        shareToken,
        createdAt: new Date()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create share link');
    }

    const data = await response.json();
    return data.shareUrl;
  } catch (error) {
    console.error('Error creating share link:', error);
    throw error;
  }
};

// Validate a share token and get the associated form
export const getSharedForm = async (shareToken) => {
  try {
    const response = await fetch(`${API_URL}/forms/shared/${shareToken}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Parse the error message from the server
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to load form');
    }

    const data = await response.json();
    
    // Validate the response data
    if (!data || !data._id) {
      throw new Error('Invalid form data received');
    }

    return data;
  } catch (error) {
    console.error('Error fetching shared form:', error);
    throw new Error('Invalid or expired share link');
  }
};
// Add to services/api.js

export const startFormResponse = async (formId) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/formsResponse/${formId}/responses/start`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const updateFormResponse = async (responseId, data,formId) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(
    `${API_URL}/formsResponse/${formId}/responses/${responseId}`,
   
    data,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const trackFormView = async (formId) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${API_URL}/formsResponse/${formId}/view`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

export const getFormAnalytics = async (formId) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(
    `${API_URL}/formsResponse/${formId}/analytics`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const getFormResponses = async (formId, params = {}) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams(params);
  
  const response = await axios.get(
    `${API_URL}/formsResponse/${formId}/responses?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};