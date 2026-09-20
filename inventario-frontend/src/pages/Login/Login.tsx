import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // 👈 Estado agregado
  const [error, setError] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) { // 👈 Pasa correo y contraseña
      navigate('/dashboard');
    } else {
      setError(true);
    }
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center',
      background: 'linear-gradient(-45deg, #344e41, #e3ddd3, #fadc51)',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 10s ease infinite',
      fontFamily: 'sans-serif'
    }}>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.33)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        padding: '50px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        textAlign: 'center',
        color: '#374151'
      }}>
        <h1 style={{ fontSize: '2.2rem', margin: '0 0 10px 0', fontWeight: '800', color: '#1f2937' }}>
          Inicia sesión
        </h1>
        <p style={{ margin: '0 0 30px 0', fontSize: '0.95rem', color: '#4b5563' }}>
          Acceso exclusivo empresarial
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(false); }}
            placeholder="admin@empresa.com"
            style={{
              width: '100%', padding: '14px', borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.6)', 
              background: 'rgba(255, 255, 255, 0.4)',
              color: '#1f2937', outline: 'none', boxSizing: 'border-box',
              fontSize: '1rem', transition: 'all 0.3s'
            }}
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            placeholder="Contraseña"
            style={{
              width: '100%', padding: '14px', borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.6)', 
              background: 'rgba(255, 255, 255, 0.4)',
              color: '#1f2937', outline: 'none', boxSizing: 'border-box',
              fontSize: '1rem', transition: 'all 0.3s'
            }}
            required
          />
          
          {error && (
            <p style={{ color: '#344e41', fontSize: '0.85rem', margin: 0, fontWeight: '600' }}>
              Credenciales incorrectas
            </p>
          )}
          
          <button
            type="submit"
            style={{
              background: '#344e41', color: '#fff', padding: '14px', border: 'none',
              borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(52, 78, 65, 0.3)', transition: 'transform 0.2s',
              marginTop: '8px'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Ingresar
          </button>
        </form>
      </div>

      <style>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        input::placeholder { color: #6b7280; opacity: 0.8; }
        input:focus { background: rgba(255, 255, 255, 0.7) !important; border: 1px solid #344e41 !important; }
      `}</style>
    </div>
  );
};