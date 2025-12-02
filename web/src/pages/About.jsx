import s from './About.module.css';

function About() {
    return (
        <main className={s['about']}>
            <section className={s['hero']}>
                <h1>About Us</h1>
                <p>Our passion for baking, your daily bread</p>
            </section>

            <section className={s['baker']}>
                <div className={s['container']}>
                    <div className={s['baker-grid']}>
                        <div className={s['baker-image']}>
                            <div className={s['image-placeholder']} style={{backgroundImage: 'url(/images/keiko.jpg)'}}></div>
                        </div>
                        <div className={s['baker-content']}>
                            <h2>Meet the Baker</h2>
                            <p>
                                Our head baker brings years of experience and a deep love for the craft. Trained in both Japanese and European techniques, each creation reflects a blend of traditions and innovation.
                            </p>
                            <p>
                                "Baking is my meditation. There's something magical about transforming simple ingredients into something that brings people together."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={s['values']}>
                <div className={s['container']}>
                    <h2>What We Believe</h2>
                    <div className={s['values-grid']}>
                        <div className={s['value-card']}>
                            <span className={s['value-icon']}>🌾</span>
                            <h3>Quality Ingredients</h3>
                            <p>We source the finest flours and ingredients, supporting local suppliers whenever possible.</p>
                        </div>
                        <div className={s['value-card']}>
                            <span className={s['value-icon']}>⏰</span>
                            <h3>Traditional Methods</h3>
                            <p>Slow fermentation, hand-shaping, and patience create bread with depth and character.</p>
                        </div>
                        <div className={s['value-card']}>
                            <span className={s['value-icon']}>❤️</span>
                            <h3>Made with Love</h3>
                            <p>Every loaf is baked with care and attention, as if we were making it for our own family.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={s['story']}>
                <div className={s['container']}>
                    <div className={s['story-grid']}>
                        <div className={s['story-content']}>
                            <h2>Our Story</h2>
                            <p>
                                Bread Kitchen started with a simple dream: to share the joy of freshly baked bread with our community. What began as a small home kitchen has grown into a beloved bakery, but our commitment to quality remains unchanged.
                            </p>
                            <p>
                                Every loaf we bake is crafted with care, using time-honored techniques and the finest ingredients. We believe that good bread takes time – there are no shortcuts to perfection.
                            </p>
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
