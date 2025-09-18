import Layout from '../components/layout/Layout';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';

const RegisterPage = () => {

  const { verifyUser } = useAuthStore();

  useEffect(() => {
    verifyUser();
  }, []);

  return (
    <Layout>
      <RegisterForm />
    </Layout>
  );
};

export default RegisterPage;
