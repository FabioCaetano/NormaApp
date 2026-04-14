import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success(t('auth.loginSuccess'));

      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || t('auth.errorLogin'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <img
            src="/logo-norma.png"
            alt="Norma Brasil Barber Salon"
            className="h-32 w-auto mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-serif font-bold text-white">NORMA BRASIL</h1>
          <p className="text-accent-400 tracking-wider text-sm">BARBER SALON</p>
        </div>

        {/* Form */}
        <div className="bg-dark-700 p-8 rounded-xl border border-primary-600/30 shadow-premium animate-slide-up">
          <h2 className="text-2xl font-serif font-bold text-white mb-6 text-center">
            {t('auth.loginWelcome')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-dark-200 text-sm font-medium mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white placeholder-dark-400 focus:border-accent-400 focus:outline-none transition-colors"
                  placeholder={t('auth.emailPlaceholder')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-dark-200 text-sm font-medium mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white placeholder-dark-400 focus:border-accent-400 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-accent-400 transition-colors"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-gold text-dark-900 font-bold rounded-lg hover:shadow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('nav.login') : t('nav.login')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-300">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-accent-400 hover:text-accent-300 font-semibold">
                {t('auth.registerHere')}
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-dark-700 rounded-lg border border-primary-600/20">
          <p className="text-sm text-dark-300 text-center">
            <span className="font-semibold text-accent-400">Demo Admin:</span> admin@normabrasi.com / admin123
          </p>
          <p className="text-sm text-dark-300 text-center mt-1">
            <span className="font-semibold text-accent-400">Demo Cliente:</span> cliente@exemplo.com / client123
          </p>
        </div>
      </div>
    </div>
  );
}
