import api from './api';

export async function fetchTasks() {
  const response = await api.get('/tasks/');
  return response.data;
}

export async function createTask(title, description) {
  const response = await api.post('/tasks/', { title, description });
  return response.data;
}

export async function updateTask(taskId, payload) {
  const response = await api.put(`/tasks/${taskId}`, payload);
  return response.data;
}

export async function deleteTask(taskId) {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
}

export async function uploadAttachment(taskId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/tasks/${taskId}/attachment`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}
