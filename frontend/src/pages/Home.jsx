import { Link } from 'react-router-dom';
import { FiScissors, FiCalendar, FiStar, FiUsers, FiCheck, FiArrowRight } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@services/api';

export default function Home() {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    api.get('/plans').then(response => setPlans(response.data)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background com gradiente */}
        <div className="absolute inset-0 bg-gradient-premium opacity-90"></div>

        {/* Padrão decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Logo grande */}
          <div className="mb-8 animate-fade-in">
            <img
              src="/logo-norma.png"
              alt="Norma Brasil Barber Salon"
              className="h-56 md:h-72 w-auto mx-auto mb-6 object-contain"
            />
          </div>

          <h2 className="text-2xl md:text-4xl font-serif text-white mb-6 animate-slide-up">
            {t('home.heroSubtitle')} <span className="text-accent-400">{t('home.heroAccent')}</span>
          </h2>

          <p className="text-lg md:text-xl text-dark-200 max-w-2xl mx-auto mb-10 animate-slide-up">
            {t('home.heroDesc')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link
              to="/booking"
              className="px-8 py-4 bg-gradient-gold text-dark-900 font-bold rounded-lg hover:shadow-gold transition-all flex items-center justify-center gap-2"
            >
              <FiCalendar />
              {t('home.bookNow')}
            </Link>
            <Link
              to="/#plans"
              className="px-8 py-4 border-2 border-accent-400 text-accent-400 font-bold rounded-lg hover:bg-accent-400 hover:text-dark-900 transition-all flex items-center justify-center gap-2"
            >
              {t('home.seePlans')}
              <FiArrowRight />
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-accent-400 rounded-full flex justify-center pt-2">
              <div className="w-1 h-3 bg-accent-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              {t('home.featuresTitle')} <span className="text-accent-400">Norma Brasil</span>?
            </h3>
            <p className="text-dark-300 max-w-2xl mx-auto">
              {t('home.featuresSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FiScissors size={32} />,
                title: t('home.feature1Title'),
                description: t('home.feature1Desc'),
              },
              {
                icon: <FiStar size={32} />,
                title: t('home.feature2Title'),
                description: t('home.feature2Desc'),
              },
              {
                icon: <FiUsers size={32} />,
                title: t('home.feature3Title'),
                description: t('home.feature3Desc'),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-dark-700 rounded-xl border border-primary-600/30 hover:border-accent-400/50 transition-all hover:shadow-premium group"
              >
                <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center text-accent-400 mb-6 group-hover:bg-accent-400 group-hover:text-dark-900 transition-all">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-serif font-bold text-white mb-3">{feature.title}</h4>
                <p className="text-dark-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 bg-dark-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              {t('home.plansTitle')} <span className="text-accent-400">{t('home.plansAccent')}</span>
            </h3>
            <p className="text-dark-300 max-w-2xl mx-auto">
              {t('home.plansSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative p-8 rounded-xl border transition-all hover:shadow-premium ${
                  index === 1
                    ? 'border-accent-400 bg-dark-700 scale-105'
                    : 'border-primary-600/30 bg-dark-700'
                }`}
              >
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-gold text-dark-900 text-sm font-bold rounded-full">
                    {t('home.mostPopular')}
                  </div>
                )}

                <h4 className="text-2xl font-serif font-bold text-white mb-2">{plan.name}</h4>
                <p className="text-dark-300 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-accent-400">
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-dark-400">{t('home.perMonth')}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-dark-200">
                    <FiCheck className="text-accent-400 flex-shrink-0" />
                    <span>{plan.sessions} {t('home.sessions')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-dark-200">
                    <FiCheck className="text-accent-400 flex-shrink-0" />
                    <span>{t('home.premiumProducts')}</span>
                  </li>
                  <li className="flex items-center gap-2 text-dark-200">
                    <FiCheck className="text-accent-400 flex-shrink-0" />
                    <span>{t('home.priorityBooking')}</span>
                  </li>
                </ul>

                <Link
                  to="/register"
                  className={`w-full py-3 rounded-lg font-bold transition-all block text-center ${
                    index === 1
                      ? 'bg-gradient-gold text-dark-900 hover:shadow-gold'
                      : 'bg-primary-600 text-white hover:bg-primary-500'
                  }`}
                >
                  {t('home.subscribeNow')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-premium">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
            {t('home.ctaTitle')}
          </h3>
          <p className="text-lg text-dark-200 mb-8 max-w-2xl mx-auto">
            {t('home.ctaDesc')}
          </p>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-gold text-dark-900 font-bold rounded-lg hover:shadow-gold transition-all text-lg"
          >
            <FiCalendar />
            {t('home.ctaButton')}
          </Link>
        </div>
      </section>
    </div>
  );
}
