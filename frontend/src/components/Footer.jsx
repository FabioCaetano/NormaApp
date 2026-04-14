import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-dark-900 border-t border-primary-600/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e descrição */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo-norma.png"
                alt="Norma Brasil Barber Salon"
                className="h-16 w-auto object-contain"
              />
              <div>
                <h3 className="text-xl font-serif font-bold text-white">NORMA BRASIL</h3>
                <p className="text-xs text-accent-400 tracking-wider">BARBER SALON</p>
              </div>
            </div>
            <p className="text-dark-300 mb-4 max-w-md">
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-accent-400 hover:text-dark-900 transition-all">
                <FiInstagram />
              </a>
              <a href="#" className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-accent-400 hover:text-dark-900 transition-all">
                <FiFacebook />
              </a>
              <a href="#" className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-accent-400 hover:text-dark-900 transition-all">
                <FiMail />
              </a>
            </div>
          </div>

          {/* Links rápidos */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-dark-300 hover:text-accent-400 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/#plans" className="text-dark-300 hover:text-accent-400 transition-colors">
                  {t('nav.plans')}
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-dark-300 hover:text-accent-400 transition-colors">
                  {t('nav.booking')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-dark-300 hover:text-accent-400 transition-colors">
                  {t('nav.myPanel')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-dark-300">
                <FiPhone className="text-accent-400" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-2 text-dark-300">
                <FiMail className="text-accent-400" />
                <span>contato@normabrasil.com</span>
              </li>
              <li className="flex items-start gap-2 text-dark-300">
                <FiMapPin className="text-accent-400 mt-1" />
                <span>Rua Exemplo, 123<br />São Paulo - SP</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-primary-600/30 text-center text-dark-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Norma Brasil Barbearia Premium. {t('footer.rights')}.</p>
        </div>
      </div>
    </footer>
  );
}
