import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'sans-serif', background: '#f8fafc', padding: '2rem'
        }}>
          <div style={{
            background: 'white', border: '1px solid #fed7aa', borderRadius: '1rem',
            padding: '2rem', maxWidth: '500px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ color: '#ea580c', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Error en la aplicación
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {this.state.error?.message || 'Error desconocido'}
            </p>
            <pre style={{
              background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem',
              fontSize: '0.75rem', textAlign: 'left', overflowX: 'auto', color: '#dc2626'
            }}>
              {this.state.error?.stack?.slice(0, 500)}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem', padding: '0.5rem 1.5rem',
                background: '#ea580c', color: 'white', border: 'none',
                borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
