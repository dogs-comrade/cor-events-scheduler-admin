import { CustomEventType } from "../components/schedules/BlockForm";

const CUSTOM_TYPES_KEY = 'event-scheduler-custom-types';

export const customTypesService = {
  getCustomTypes(): CustomEventType[] {
    const stored = localStorage.getItem(CUSTOM_TYPES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveCustomType(type: CustomEventType) {
    const types = this.getCustomTypes();
    types.push(type);
    localStorage.setItem(CUSTOM_TYPES_KEY, JSON.stringify(types));
    return types;
  },

  updateCustomType(type: CustomEventType) {
    const types = this.getCustomTypes();
    const index = types.findIndex(t => t.id === type.id);
    if (index !== -1) {
      types[index] = type;
      localStorage.setItem(CUSTOM_TYPES_KEY, JSON.stringify(types));
    }
    return types;
  },

  deleteCustomType(id: number) {
    const types = this.getCustomTypes();
    const filtered = types.filter(t => t.id !== id);
    localStorage.setItem(CUSTOM_TYPES_KEY, JSON.stringify(filtered));
    return filtered;
  }
};