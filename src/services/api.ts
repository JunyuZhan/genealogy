import { keysToCamel, keysToSnake } from '../utils/mapper';

const BASE_URL = '/api';

export async function get<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  const data = await response.json();
  // Unwrap 'data' property if it exists (standard API response format)
  const result = data.data ? data.data : data;
  return keysToCamel(result) as T;
}

export async function post<T>(endpoint: string, data: any): Promise<T> {
  const snakeData = keysToSnake(data);
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(snakeData),
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  const responseData = await response.json();
  const result = responseData.data ? responseData.data : responseData;
  return keysToCamel(result) as T;
}

// Specific API methods
export const api = {
  // Members
  getMembers: () => get<any[]>('/members'),
  getMember: (id: string) => get<any>(`/members/${id}`),
  createMember: (data: any) => post<any>('/members', data),
  updateMember: (id: string, data: any) => post<any>(`/members/${id}?_method=PUT`, data), // Using POST with override or implementing PUT helper if needed

  // Other modules
  getNews: () => get<any[]>('/announcements'), // Mapped to announcements
  getDonations: () => get<any[]>('/donations'),
  getAncestors: () => get<any[]>('/memorial/ancestors'), // Assuming this endpoint exists or needs creation
  getMutualAid: () => get<any[]>('/campaigns'),
  getBranches: () => get<any[]>('/branches'),
  getBranchReviews: () => get<any[]>('/requests'), // Mapping to info requests
  getWorshipRecords: () => get<any[]>('/memorial/logs'), // Mapping to logs

  // System Config
  getPublicConfig: () => get<any>('/config/public'),
};

