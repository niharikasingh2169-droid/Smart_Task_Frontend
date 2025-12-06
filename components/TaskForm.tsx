'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Typography,
  Paper,
  CircularProgress,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { Task, CreateTaskRequest, UpdateTaskRequest, taskService, TaskPriority } from '@/services/taskService';
import { useSnackbar } from '@/components/SnackbarProvider';
import PsychologyIcon from '@mui/icons-material/Psychology';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitButtonText?: string;
  showDeleteButton?: boolean;
  isCreateMode?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onDelete,
  submitButtonText = 'Submit',
  showDeleteButton = false,
  isCreateMode = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Dayjs | null>(null);
  const [status, setStatus] = useState<'Pending' | 'InWork' | 'Complete'>('Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Validation errors
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [dueDateError, setDueDateError] = useState('');
  
  // Touched state - track if field has been interacted with
  const [touched, setTouched] = useState({
    title: false,
    description: false,
    dueDate: false,
  });

  // AI Priority state
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [priorityData, setPriorityData] = useState<{ priority_score: number; summary: string } | null>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (task) {
      setTitle(task.Title);
      setDescription(task.Description);
      setDueDate(task.Due_Date ? dayjs(task.Due_Date, 'DD-MM-YYYY') : null);
      setStatus(task.Status);
    } else {
      // Reset to defaults for create mode
      setTitle('');
      setDescription('');
      setDueDate(null);
      setStatus('Pending');
    }
    // Clear errors and touched state when task changes
    setTitleError('');
    setDescriptionError('');
    setDueDateError('');
    setTouched({
      title: false,
      description: false,
      dueDate: false,
    });
    // Clear priority data when task changes
    setPriorityData(null);
  }, [task]);

  // Validation function
  const validateForm = (): boolean => {
    let isValid = true;

    // Title validation
    if (!title.trim()) {
      setTitleError('Title cannot be blank');
      isValid = false;
    } else {
      setTitleError('');
    }

    // Description validation
    if (!description.trim()) {
      setDescriptionError('Description cannot be blank');
      isValid = false;
    } else {
      setDescriptionError('');
    }

    // Due date validation
    if (!dueDate) {
      setDueDateError('Due date is required');
      isValid = false;
    } else {
      const today = dayjs().startOf('day');
      const selectedDate = dueDate.startOf('day');
      
      // For create mode, due date must be in future
      if (isCreateMode && selectedDate.isBefore(today)) {
        setDueDateError('Due date must be in the future');
        isValid = false;
      } else {
        setDueDateError('');
      }
    }

    return isValid;
  };

  // Check if form is valid (for button disable state)
  const isFormValid = (): boolean => {
    return (
      title.trim() !== '' &&
      description.trim() !== '' &&
      dueDate !== null &&
      (isCreateMode ? dueDate.isAfter(dayjs().startOf('day')) : true)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched when form is submitted
    setTouched({
      title: true,
      description: true,
      dueDate: true,
    });
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: CreateTaskRequest | UpdateTaskRequest = {
        Title: title.trim(),
        Description: description.trim(),
        Due_Date: dueDate ? dueDate.format('DD-MM-YYYY') : '',
        Status: status,
      };

      await onSubmit(formData);
    } catch (error) {
      // Error handling is done in parent component
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (titleError && value.trim()) {
      setTitleError('');
    }
  };

  const handleTitleBlur = () => {
    setTouched((prev) => ({ ...prev, title: true }));
    // Validate on blur
    if (!title.trim()) {
      setTitleError('Title cannot be blank');
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (descriptionError && value.trim()) {
      setDescriptionError('');
    }
  };

  const handleDescriptionBlur = () => {
    setTouched((prev) => ({ ...prev, description: true }));
    // Validate on blur
    if (!description.trim()) {
      setDescriptionError('Description cannot be blank');
    }
  };

  const handleDueDateChange = (newValue: Dayjs | null) => {
    // Update state first
    setDueDate(newValue);
    
    // Mark as touched when date is selected or cleared
    setTouched((prev) => ({ ...prev, dueDate: true }));
    
    // Validate immediately when date changes
    if (!newValue) {
      // If date is cleared and field is touched, show error
      setDueDateError('Due date is required');
    } else {
      // Validate the new value
      const today = dayjs().startOf('day');
      const selectedDate = newValue.startOf('day');
      
      if (isCreateMode && (selectedDate.isBefore(today) || selectedDate.isSame(today))) {
        setDueDateError('Due date must be in the future');
      } else {
        // Clear error if date is valid
        setDueDateError('');
      }
    }
  };

  const handleDueDateBlur = () => {
    setTouched((prev) => ({ ...prev, dueDate: true }));
    // Validate on blur - re-validate to ensure consistency
    if (!dueDate) {
      setDueDateError('Due date is required');
    } else if (isCreateMode) {
      const today = dayjs().startOf('day');
      const selectedDate = dueDate.startOf('day');
      if (selectedDate.isBefore(today) || selectedDate.isSame(today)) {
        setDueDateError('Due date must be in the future');
      } else {
        setDueDateError('');
      }
    } else {
      setDueDateError('');
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGetPriority = async () => {
    if (!task) return;

    setPriorityLoading(true);
    try {
      const priority = await taskService.getTaskPriority(task.Id);
      console.log('Raw API response:', priority);
      
      // Handle potential variations in API response field names
      // The API might return summary, reasoning, or explanation
      const summaryText = priority.summary || priority.reasoning || priority.explanation || 'No reasoning provided.';
      
      const priorityResponse = {
        priority_score: priority.priority_score,
        summary: summaryText,
      };
      
      console.log('Processed priority data:', priorityResponse);
      setPriorityData(priorityResponse);
    } catch (error) {
      showSnackbar('Failed to fetch AI priority. Please try again.', 'error');
      console.error('Error fetching priority:', error);
    } finally {
      setPriorityLoading(false);
    }
  };

  const getPriorityColor = (score: number) => {
    switch (score) {
      case 1:
        return '#f44336'; // Red - Highest priority
      case 2:
        return '#ff5722'; // Deep Orange
      case 3:
        return '#ff9800'; // Orange
      case 4:
        return '#ffc107'; // Amber
      case 5:
        return '#4caf50'; // Green - Lowest priority
      default:
        return '#9e9e9e';
    }
  };

  const getPriorityLabel = (score: number) => {
    switch (score) {
      case 1:
        return 'Critical';
      case 2:
        return 'High';
      case 3:
        return 'Medium';
      case 4:
        return 'Low';
      case 5:
        return 'Very Low';
      default:
        return 'Unknown';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              required
              variant="outlined"
              error={touched.title && !!titleError}
              helperText={touched.title ? titleError : ''}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onBlur={handleDescriptionBlur}
              required
              multiline
              rows={4}
              variant="outlined"
              error={touched.description && !!descriptionError}
              helperText={touched.description ? descriptionError : ''}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Due Date"
              value={dueDate}
              onChange={handleDueDateChange}
              minDate={isCreateMode ? dayjs().add(1, 'day') : undefined}
              format="DD-MM-YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  error: touched.dueDate && !!dueDateError,
                  helperText: touched.dueDate ? dueDateError : '',
                  onBlur: handleDueDateBlur,
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value as 'Pending' | 'InWork' | 'Complete')}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="InWork">InWork</MenuItem>
                <MenuItem value="Complete">Complete</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              {showDeleteButton && onDelete && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting || isDeleting || !isFormValid()}
                sx={{ minWidth: 120 }}
              >
                {isSubmitting ? 'Submitting...' : submitButtonText}
              </Button>
            </Box>
          </Grid>

          {/* AI Priority Section - Only show in edit mode */}
          {task && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={priorityLoading ? <CircularProgress size={20} /> : <PsychologyIcon />}
                    onClick={handleGetPriority}
                    disabled={priorityLoading || isSubmitting || isDeleting}
                    sx={{
                      alignSelf: 'flex-start',
                      minWidth: 180,
                      fontWeight: 600,
                    }}
                  >
                    {priorityLoading ? 'Getting Priority...' : 'GET AI Priority'}
                  </Button>

                  {priorityData && (
                    <Paper
                      sx={{
                        p: 3,
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        borderRadius: 2,
                        boxShadow: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: getPriorityColor(priorityData.priority_score),
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '2rem',
                            boxShadow: 3,
                          }}
                        >
                          {priorityData.priority_score}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Priority Score: {priorityData.priority_score}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: getPriorityColor(priorityData.priority_score),
                              fontWeight: 600,
                            }}
                          >
                            {getPriorityLabel(priorityData.priority_score)} Priority
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            (1 = Highest Priority, 5 = Lowest Priority)
                          </Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
                          Reasoning:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            lineHeight: 1.8,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            minHeight: '40px',
                            display: 'block',
                          }}
                        >
                          {priorityData.summary && priorityData.summary.trim() 
                            ? priorityData.summary 
                            : 'No reasoning provided.'}
                        </Typography>
                      </Box>
                    </Paper>
                  )}
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default TaskForm;

