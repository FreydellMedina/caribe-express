import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, ShieldCheck, Truck, LogIn, UserPlus, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser, token: string) => void;
  defaultRole?: UserRole;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
}

type AuthMode = 'login' | 'register';

async function apiAuth(endpoint: string, body: object) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Error de autenticación');
  return data;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultRole = 'cliente',
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      let result: any;
      if (mode === 'login') {
        result = await apiAuth('/auth/login', { email, password });
      } else {
        if (!fullName.trim()) throw new Error('El nombre completo es requerido.');
        if (password.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');
        result = await apiAuth('/auth/register', {
          email,
          password,
          full_name: fullName,
          phone: phone || null,
          role,
        });
      }

      // Persist token in sessionStorage (cleared on tab close)
      sessionStorage.setItem('caribe_token', result.access_token);
      sessionStorage.setItem('caribe_user', JSON.stringify(result.user));

      setSuccess(mode === 'login' ? '¡Sesión iniciada correctamente!' : '¡Cuenta creada exitosamente!');
      setTimeout(() => {
        onLoginSuccess(result.user, result.access_token);
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Error inesperado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoRole: UserRole) => {
    const demos: Record<UserRole, { email: string; password: string }> = {
      cliente: { email: 'cliente@caribeexpress.co', password: 'Cliente2026!' },
      transportista: { email: 'operaciones@transportesdelcaribe.com.co', password: 'Carrier2026!' },
      admin: { email: 'admin@caribeexpress.co', password: 'AdminCaribe2026!' },
    };
    setEmail(demos[demoRole].email);
    setPassword(demos[demoRole].password);
    setRole(demoRole);
    setMode('login');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h2>
              <p className="text-xs text-orange-100">Caribe Express · Plataforma MVP</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo credentials pills */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Acceso rápido de demostración</p>
          <div className="flex gap-2 flex-wrap">
            {(['cliente', 'transportista', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => fillDemo(r)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize bg-slate-50 border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700"
              >
                {r === 'cliente' ? '👤 Cliente' : r === 'transportista' ? '🚛 Transportista' : '🛡️ Admin'}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 overflow-y-auto">

          {/* Mode toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${mode === 'login' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LogIn className="w-3.5 h-3.5 inline mr-1.5" />
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${mode === 'register' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <UserPlus className="w-3.5 h-3.5 inline mr-1.5" />
              Registrarme
            </button>
          </div>

          {/* Register-only fields */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ej. Juan Carlos Restrepo"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono (Opcional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 300 000 0000"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Cuenta *</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { val: 'cliente' as UserRole, label: 'Cliente', icon: '👤', desc: 'Cotizar mudanzas' },
                    { val: 'transportista' as UserRole, label: 'Transportista', icon: '🚛', desc: 'Prestar servicio' },
                    { val: 'admin' as UserRole, label: 'Admin', icon: '🛡️', desc: 'Gestionar plataforma' },
                  ]).map(({ val, label, icon, desc }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRole(val)}
                      className={`p-2.5 rounded-xl border-2 text-center transition-all ${role === val ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <span className="text-lg block">{icon}</span>
                      <span className="text-[10px] font-bold text-slate-700 block">{label}</span>
                      <span className="text-[9px] text-slate-400">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? '••••••••' : 'Mínimo 6 caracteres'}
                className="w-full pl-9 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error / Success messages */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : mode === 'login' ? (
              <><LogIn className="w-4 h-4" /> Ingresar</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Crear Cuenta</>
            )}
          </button>
        </form>

        {/* Footer Legal */}
        <div className="px-6 pb-4 text-center">
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-green-500" />
            Protegido por cifrado TLS · Ley 1581 de 2012 (Colombia) / GDPR
          </p>
        </div>
      </div>
    </div>
  );
};

