'use client';

import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, CircularProgress, Avatar, IconButton } from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import TaskForm from '@/components/TaskForm';
import { taskService, Task, UpdateTaskRequest } from '@/services/taskService';
import { useSnackbar } from '@/components/SnackbarProvider';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = parseInt(params.id as string);
  const { showSnackbar } = useSnackbar();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTaskById(taskId);
      setTask(data);
    } catch (error) {
      showSnackbar('Failed to fetch task details. Please try again.', 'error');
      console.error('Error fetching task:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: UpdateTaskRequest) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, data);
      // Update the task state with the response to reflect changes
      setTask(updatedTask);
      showSnackbar('Task updated successfully!', 'success');
      // Stay on the page - no navigation
    } catch (error) {
      showSnackbar('Failed to update task. Please try again.', 'error');
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await taskService.deleteTask(taskId);
      showSnackbar('Task deleted successfully!', 'success');
      router.push('/');
    } catch (error) {
      showSnackbar('Failed to delete task. Please try again.', 'error');
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Paper
          sx={{
            p: 4,
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: 6,
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={60} sx={{ mb: 3 }} />
            <Typography variant="h6" color="text.secondary">
              Loading task details...
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(10px)',
              boxShadow: 6,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="error">
              Task not found
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          sx={{
            p: 4,
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: 6,
            borderRadius: 2,
          }}
        >
          <Box sx={{ mb: 2 }}>
            <IconButton
              onClick={() => router.push('/')}
              sx={{
                mb: 2,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
                boxShadow: 3,
              }}
            >
              <EditIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                Edit Task
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update task details below
              </Typography>
            </Box>
          </Box>
          <TaskForm
            task={task}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            submitButtonText="Update Task"
            showDeleteButton={true}
            isCreateMode={false}
          />
        </Paper>
      </Container>
    </Box>
  );
}

