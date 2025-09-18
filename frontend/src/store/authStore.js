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
  },

  oauth: async () => {
    window.location.href = "http://localhost:3000/api/users/register/google";
  },

  verifyUser: async () => {
    const resp = await fetch("http://localhost:3000/api/users/is_auth", {
      credentials: 'include'
    });

    const { ok, msg, userInfo } = await resp.json();

    if (ok) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      if (window.location.href === "http://localhost:5173/login"
        || window.location.href === "http://localhost:5173/register"
      ) {
        window.location.href = "http://localhost:5173/dashboard";
      }

      return;
    } else if (window.location.href !== "http://localhost:5173/login"
      && window.location.href !== "http://localhost:5173/register"
    ) {
      window.location.href = "http://localhost:5173/login";
    }
  }
}));
