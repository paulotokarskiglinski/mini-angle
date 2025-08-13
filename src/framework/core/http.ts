import { Injectable } from 'mini-angle';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  async get<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }

  async post<T>(url: string, data: any): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }

  async put<T>(url: string, data: any): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }

  async patch<T>(url: string, data: any): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      return text ? JSON.parse(text) : {} as T;
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }

  async head(url: string): Promise<Headers> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.headers;
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }

  async options(url: string): Promise<Headers> {
    try {
      const response = await fetch(url, {
        method: 'OPTIONS',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.headers;
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }
}
