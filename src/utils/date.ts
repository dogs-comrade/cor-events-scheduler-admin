import { format, parseISO } from 'date-fns';

export const formatDate = (date: string) => {
  try {
    return format(parseISO(date), 'PPP');
  } catch (error) {
    return date;
  }
};

export const formatTime = (date: string) => {
  try {
    return format(parseISO(date), 'p');
  } catch (error) {
    return date;
  }
};

export const formatDateTime = (date: string) => {
  try {
    return format(parseISO(date), 'PPp');
  } catch (error) {
    return date;
  }
};