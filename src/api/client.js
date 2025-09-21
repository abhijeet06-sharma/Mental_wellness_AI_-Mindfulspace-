// The base URL of your deployed FastAPI backend
const API_BASE_URL = "https://mental-wellness-ai-mindfulspace.onrender.com";

const apiClient = async (endpoint, options = {}) => {
  // Get the token from localStorage
  const token = localStorage.getItem("token");

  // Default headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // If a token exists, add the Authorization header
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Build the full request URL
  const url = `${API_BASE_URL}${endpoint}`;

  // Make the fetch request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If the response is a 401 Unauthorized, the token might be bad.
  // Remove it and redirect to the login page
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  // If the response is not ok for other reasons, throw an error
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "An unknown error occurred" }));
    throw new Error(errorData.detail);
  }

  // If the response has JSON content, parse and return it
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  
  // Otherwise, return the raw response
  return response;
};

export default apiClient;
