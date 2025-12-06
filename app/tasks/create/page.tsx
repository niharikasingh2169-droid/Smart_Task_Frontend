'use client';

import React from 'react';
import { Container, Box, Typography, Paper, Avatar, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import TaskForm from '@/components/TaskForm';
import { taskService, CreateTaskRequest, UpdateTaskRequest } from '@/services/taskService';
import { useSnackbar } from '@/components/SnackbarProvider';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function CreateTaskPage() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  const handleSubmit = async (data: CreateTaskRequest | UpdateTaskRequest) => {
    try {
      // In create mode, all fields are required, so we can safely cast
      await taskService.createTask(data as CreateTaskRequest);
      showSnackbar('Task created successfully!', 'success');
      router.push('/');
    } catch (error) {
      showSnackbar('Failed to create task. Please try again.', 'error');
      console.error('Error creating task:', error);
      throw error;
    }
  };

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
              <AddIcon sx={{ fontSize: 32 }} />
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
                Create New Task
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill in the details to create a new task
              </Typography>
            </Box>
          </Box>
          <TaskForm
            onSubmit={handleSubmit}
            submitButtonText="Create Task"
            isCreateMode={true}
          />
        </Paper>
      </Container>
    </Box>
  );
}

