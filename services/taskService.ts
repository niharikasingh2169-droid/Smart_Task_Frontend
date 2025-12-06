// Get API base URL from environment variable, fallback to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/tasks';

export interface Task {
  Id: number;
  Title: string;
  Description: string;
  Due_Date: string;
  Status: 'Pending' | 'InWork' | 'Complete';
  Created_At: string;
}

export interface CreateTaskRequest {
  Title: string;
  Description: string;
  Due_Date: string;
  Status: 'Pending' | 'InWork' | 'Complete';
}

export interface UpdateTaskRequest {
  Title?: string;
  Description?: string;
  Due_Date?: string;
  Status?: 'Pending' | 'InWork' | 'Complete';
}

export interface TaskPriority {
  priority_score: number;
  summary?: string;
  reasoning?: string;
  explanation?: string;
}

class TaskService {
  async getAllTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    return response.json();
  }

  async getTaskById(id: number): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch task: ${response.statusText}`);
    }

    return response.json();
  }

  async createTask(task: CreateTaskRequest): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    return response.json();
  }

  async updateTask(id: number, task: UpdateTaskRequest): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteTask(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`);
    }
  }

  async getTaskPriority(id: number): Promise<TaskPriority> {
    const response = await fetch(`${API_BASE_URL}/${id}/priority`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch task priority: ${response.statusText}`);
    }

    return response.json();
  }
}

export const taskService = new TaskService();

