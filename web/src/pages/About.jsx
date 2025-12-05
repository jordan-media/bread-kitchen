import s from './About.module.css';
import { useTranslation } from '../hooks/useTranslation';

function About() {
    const { t } = useTranslation('about');

    return (
        <main className={s['about']}>
            <section className={s['hero']}>
                <h1>{t('hero.title')}</h1>
                <p>{t('hero.subtitle')}</p>
            </section>

            <section className={s['baker']}>
                <div className={s['container']}>
                    <div className={s['baker-grid']}>
                        <div className={s['baker-image']}>
                            <div className={s['image-placeholder']} style={{backgroundImage: 'url(/images/keiko.jpg)'}}></div>
                        </div>
                        <div className={s['baker-content']}>
                            <h2>{t('baker.title')}</h2>
                            <p>{t('baker.bio')}</p>
                            <p>"{t('baker.philosophy')}"</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={s['values']}>
                <div className={s['container']}>
                    <h2>{t('values.title')}</h2>
                    <div className={s['values-grid']}>
                        <div className={s['value-card']}>
                            <span className={s['value-icon']}>🌾</span>
                            <h3>{t('values.quality.title')}</h3>
                            <p>{t('values.quality.description')}</p>
                        </div>
                        <div className={s['value-card']}>
                            <span className={s['value-icon']}>⏰</span>
                            <h3>{t('values.traditional.title')}</h3>
                            <p>{t('values.traditional.description')}</p>
                        </div>
                        <div className={s['value-card']}>
                            <span className={s['value-icon']}>❤️</span>
                            <h3>{t('values.love.title')}</h3>
                            <p>{t('values.love.description')}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={s['story']}>
                <div className={s['container']}>
                    <div className={s['story-grid']}>
                        <div className={s['story-content']}>
                            <h2>{t('story.title')}</h2>
                            <p>{t('story.paragraph1')}</p>
                            <p>{t('story.paragraph2')}</p>
                        </div>
                        <div className={s['story-image']}>
                            <div className={s['image-placeholder']} style={{backgroundImage: 'url(/images/about.jpg)'}}></div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default About;
