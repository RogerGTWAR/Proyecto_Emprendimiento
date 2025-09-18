import Layout from '../components/layout/Layout';
import LoginForm from '../components/auth/LoginForm';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

const LoginPage = () => {

  const { verifyUser } = useAuthStore();

  useEffect(() => {
    verifyUser();
  }, []);

  return (
    <Layout>
      <LoginForm />
    </Layout>
  );
};

export default LoginPage;
