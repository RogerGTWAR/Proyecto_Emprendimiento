import Layout from '../components/layout/Layout';

const Home = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to MateriaLab
          </h1>
        </div>
      </div>
    </Layout>
  );
};

export default Home;