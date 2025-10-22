import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import UserPanel from './components/UserPanel';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={
          <RequireAuth>
            <Layout>
              <AdminPanel />
            </Layout>
          </RequireAuth>
        } />
        <Route path="/usuario" element={
          <RequireAuth>
            <Layout>
              <UserPanel />
            </Layout>
          </RequireAuth>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
