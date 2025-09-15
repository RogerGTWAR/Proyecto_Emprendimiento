import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  formData: {
    companyName: '',
    companyType: '',
    email: '',
    password: ''
  },
  loading: false,
  
  setFormData: (name, value) => {
    set(state => ({
      formData: {
        ...state.formData,
        [name]: value
      }
    }));
  },

  register: async () => {
    set({ loading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Registrando:', get().formData);
      return true;
    } catch (error) {
      console.error('Error en registro:', error);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  login: async () => {
    set({ loading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Login:', get().formData);
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    } finally {
      set({ loading: false });
    }
  }
}));