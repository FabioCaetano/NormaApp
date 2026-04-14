import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import CountryCodeSelector from '@components/CountryCodeSelector';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+55');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('auth.passwordMin'));
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, countryCode + formData.phone.replace(/[^\d]/g, ''), formData.password);
      toast.success(t('auth.accountCreated'));
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || t('auth.errorCreating'));
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
            {t('auth.createAccount')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-dark-200 text-sm font-medium mb-2">
                {t('auth.fullName')}
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white placeholder-dark-400 focus:border-accent-400 focus:outline-none transition-colors"
                  placeholder={t('auth.yourName')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-dark-200 text-sm font-medium mb-2">
                {t('auth.email')}
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white placeholder-dark-400 focus:border-accent-400 focus:outline-none transition-colors"
                  placeholder={t('auth.emailPlaceholder')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-dark-200 text-sm font-medium mb-2">
                {t('auth.phone')}
              </label>
              <div className="flex">
                <CountryCodeSelector value={countryCode} onChange={setCountryCode} />
                <div className="relative flex-1">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-dark-600 border border-primary-600/30 rounded-r-lg text-white placeholder-dark-400 focus:border-accent-400 focus:outline-none transition-colors"
                    placeholder={t('auth.phonePlaceholder')}
                    required
                  />
                </div>
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

            <div>
              <label className="block text-dark-200 text-sm font-medium mb-2">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 bg-dark-600 border border-primary-600/30 rounded-lg text-white placeholder-dark-400 focus:border-accent-400 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-accent-400 transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-gold text-dark-900 font-bold rounded-lg hover:shadow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.signingUp') : t('auth.signUp')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-300">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="text-accent-400 hover:text-accent-300 font-semibold">
                {t('auth.loginHere')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
