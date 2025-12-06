'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Pagination,
  Paper,
  CircularProgress,
  Chip,
  Grid,
  InputAdornment,
  Avatar,
  alpha,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import WorkIcon from '@mui/icons-material/Work';
import TaskIcon from '@mui/icons-material/Task';
import { useRouter } from 'next/navigation';
import { taskService, Task } from '@/services/taskService';
import { useSnackbar } from '@/components/SnackbarProvider';
import dayjs from 'dayjs';

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [searchQuery, tasks]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (error) {
      showSnackbar('Failed to fetch tasks. Please try again later.', 'error');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    if (!searchQuery.trim()) {
      setFilteredTasks(tasks);
      setCurrentPage(1);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = tasks.filter(
      (task) =>
        task.Title.toLowerCase().includes(query) ||
        task.Description.toLowerCase().includes(query) ||
        task.Status.toLowerCase().includes(query)
    );
    setFilteredTasks(filtered);
    setCurrentPage(1);
  };

  const handleEdit = (taskId: number) => {
    router.push(`/tasks/${taskId}/edit`);
  };

  const handleCreate = () => {
    router.push('/tasks/create');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'success';
      case 'InWork':
        return 'warning';
      case 'Pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete':
        return <CheckCircleIcon />;
      case 'InWork':
        return <WorkIcon />;
      case 'Pending':
        return <PendingIcon />;
      default:
        return <TaskIcon />;
    }
  };

  const getDueDateStatus = (dueDate: string) => {
    const due = dayjs(dueDate, 'DD-MM-YYYY');
    const today = dayjs();
    const diff = due.diff(today, 'day');

    if (diff < 0) {
      return { label: 'Overdue', color: 'error', severity: 'high' };
    } else if (diff === 0) {
      return { label: 'Due Today', color: 'warning', severity: 'high' };
    } else if (diff <= 3) {
      return { label: 'Due Soon', color: 'warning', severity: 'medium' };
    }
    return { label: 'Upcoming', color: 'info', severity: 'low' };
  };

  const getTaskCounts = () => {
    return {
      total: filteredTasks.length,
      pending: filteredTasks.filter((t) => t.Status === 'Pending').length,
      inWork: filteredTasks.filter((t) => t.Status === 'InWork').length,
      complete: filteredTasks.filter((t) => t.Status === 'Complete').length,
    };
  };

  const taskCounts = getTaskCounts();

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 56,
                height: 56,
                boxShadow: 3,
              }}
            >
              <TaskIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                Task Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Manage and track your tasks efficiently
              </Typography>
            </Box>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 3,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {taskCounts.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tasks
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 3,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {taskCounts.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 3,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {taskCounts.inWork}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 3,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {taskCounts.complete}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Search and Create Section */}
          <Paper
            sx={{
              p: 3,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: 4,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                label="Search Tasks"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flexGrow: 1, minWidth: 250 }}
                placeholder="Search by title, description, or status..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                sx={{
                  minWidth: 150,
                  height: 56,
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Create Task
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Tasks Grid */}
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 8,
              background: 'rgba(255,255,255,0.95)',
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : paginatedTasks.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <TaskIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {searchQuery ? 'No tasks found matching your search.' : 'No tasks available.'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchQuery
                ? 'Try adjusting your search criteria.'
                : 'Click "Create Task" to get started!'}
            </Typography>
          </Paper>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {paginatedTasks.map((task) => {
                const dueDateStatus = getDueDateStatus(task.Due_Date);
                return (
                  <Box
                    key={task.Id}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      p: 3,
                      background: 'rgba(255,255,255,0.98)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: 2,
                      boxShadow: 3,
                      transition: 'all 0.3s ease',
                      borderLeft: `4px solid ${
                        task.Status === 'Complete'
                          ? '#4caf50'
                          : task.Status === 'InWork'
                          ? '#ff9800'
                          : '#9e9e9e'
                      }`,
                      '&:hover': {
                        transform: 'translateX(4px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    {/* Main Content */}
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      {/* Header with Title and Status */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          mb: 1.5,
                          gap: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="h2"
                          sx={{
                            fontWeight: 600,
                            flexGrow: 1,
                            lineHeight: 1.3,
                          }}
                        >
                          {task.Title}
                        </Typography>
                        <Chip
                          icon={getStatusIcon(task.Status)}
                          label={task.Status}
                          color={getStatusColor(task.Status) as any}
                          size="small"
                          sx={{ fontWeight: 600, flexShrink: 0 }}
                        />
                      </Box>

                      {/* Description */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, alignItems: 'flex-start' }}>
                        <DescriptionIcon
                          sx={{ fontSize: 18, color: 'text.secondary', mt: 0.5, flexShrink: 0 }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            flexGrow: 1,
                            lineHeight: 1.5,
                          }}
                        >
                          {task.Description || 'No description provided'}
                        </Typography>
                      </Box>

                      {/* Date Information */}
                      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Due Date */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            borderRadius: 1,
                            bgcolor: alpha(
                              dueDateStatus.color === 'error'
                                ? '#f44336'
                                : dueDateStatus.color === 'warning'
                                ? '#ff9800'
                                : '#2196f3',
                              0.1
                            ),
                          }}
                        >
                          <CalendarTodayIcon
                            sx={{
                              fontSize: 16,
                              color:
                                dueDateStatus.color === 'error'
                                  ? 'error.main'
                                  : dueDateStatus.color === 'warning'
                                  ? 'warning.main'
                                  : 'info.main',
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color:
                                dueDateStatus.color === 'error'
                                  ? 'error.main'
                                  : dueDateStatus.color === 'warning'
                                  ? 'warning.main'
                                  : 'info.main',
                            }}
                          >
                            {dayjs(task.Due_Date, 'DD-MM-YYYY').format('DD-MM-YYYY')}
                          </Typography>
                          <Chip
                            label={dueDateStatus.label}
                            size="small"
                            color={dueDateStatus.color as any}
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        </Box>

                        {/* Created Date */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Created:{' '}
                            {new Date(task.Created_At).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Edit Button */}
                    <Box sx={{ flexShrink: 0 }}>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(task.Id)}
                        sx={{
                          fontWeight: 600,
                          textTransform: 'none',
                          boxShadow: 2,
                          minWidth: 120,
                          '&:hover': {
                            boxShadow: 4,
                          },
                        }}
                      >
                        Edit
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4,
                  pt: 3,
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 3,
                    borderRadius: 2,
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => setCurrentPage(page)}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Paper>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

