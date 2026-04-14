import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@components/LanguageSwitcher';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-900/95 backdrop-blur-sm border-b border-primary-600/30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo-norma.png"
              alt="Norma Brasil Barber Salon"
              className="h-14 w-auto object-contain"
            />
            <div className="hidden md:block">
              <h1 className="text-lg font-serif font-bold text-white">NORMA BRASIL</h1>
              <p className="text-[10px] text-accent-400 tracking-wider">BARBER SALON</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-white hover:text-accent-400 transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/#plans" className="text-white hover:text-accent-400 transition-colors">
              {t('nav.plans')}
            </Link>
            <Link to="/booking" className="text-white hover:text-accent-400 transition-colors">
              {t('nav.booking')}
            </Link>

            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center gap-4">
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors"
                  >
                    {t('nav.adminPanel')}
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors"
                  >
                    {t('nav.myPanel')}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-white hover:text-accent-400 transition-colors"
                >
                  <FiLogOut />
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-white hover:text-accent-400 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-gold text-dark-900 font-semibold rounded-lg hover:shadow-gold transition-all"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-primary-600/30 animate-slide-down">
            <div className="flex flex-col gap-4">
              <Link to="/" className="text-white hover:text-accent-400 transition-colors py-2">
                {t('nav.home')}
              </Link>
              <Link to="/#plans" className="text-white hover:text-accent-400 transition-colors py-2">
                {t('nav.plans')}
              </Link>
              <Link to="/booking" className="text-white hover:text-accent-400 transition-colors py-2">
                {t('nav.booking')}
              </Link>

              <LanguageSwitcher />

              {user ? (
                <>
                  {isAdmin ? (
                    <Link
                      to="/admin"
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors text-center"
                    >
                      {t('nav.adminPanel')}
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg transition-colors text-center"
                    >
                      {t('nav.myPanel')}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-white hover:text-accent-400 transition-colors"
                  >
                    <FiLogOut />
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 border border-accent-400 text-accent-400 rounded-lg hover:bg-accent-400 hover:text-dark-900 transition-colors text-center"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 bg-gradient-gold text-dark-900 font-semibold rounded-lg hover:shadow-gold transition-all text-center"
                  >
                    {t('nav.register')}
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
