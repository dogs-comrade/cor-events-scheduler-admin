import { Schedule, Block } from '../api/types';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateSchedule = (schedule: Schedule): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!schedule.name) {
    errors.push({
      field: 'name',
      message: 'Schedule name is required'
    });
  }

  if (!schedule.start_date) {
    errors.push({
      field: 'start_date',
      message: 'Start date is required'
    });
  }

  if (!schedule.end_date) {
    errors.push({
      field: 'end_date',
      message: 'End date is required'
    });
  }

  if (schedule.start_date && schedule.end_date && 
      new Date(schedule.start_date) > new Date(schedule.end_date)) {
    errors.push({
      field: 'end_date',
      message: 'End date must be after start date'
    });
  }

  if (schedule.blocks) {
    schedule.blocks.forEach((block, index) => {
      const blockErrors = validateBlock(block);
      blockErrors.forEach(error => {
        errors.push({
          field: `blocks[${index}].${error.field}`,
          message: error.message
        });
      });
    });
  }

  return errors;
};

export const validateBlock = (block: Block): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!block.name) {
    errors.push({
      field: 'name',
      message: 'Block name is required'
    });
  }

  if (!block.duration || block.duration <= 0) {
    errors.push({
      field: 'duration',
      message: 'Duration must be greater than 0'
    });
  }

  if (block.complexity !== undefined && (block.complexity < 0 || block.complexity > 1)) {
    errors.push({
      field: 'complexity',
      message: 'Complexity must be between 0 and 1'
    });
  }

  return errors;
};