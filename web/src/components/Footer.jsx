import f from './Footer.module.css';
import g from '../global.module.css';

function Footer () {
  return (
    <footer className={f['footer-bg']}>
        <div className={`${g['container']} ${f['footer-content']}`}>
            <div className={f['footer-info']}>
                <div className={f['logo-section']}>
                    {/* Placeholder for logo - can use same as header or inverted version */}
                    <div className={f['logo-placeholder']}>
                        <span className={f['logo-text-ja']}>パン教室</span>
                        <span className={f['logo-text-en']}>Bread Kitchen</span>
                    </div>
                </div>
                <div className={f['business-info']}>
                    <p className={f['tagline']}>Baking bread since 1976</p>
                    <p className={f['ownership']}>Family owned and operated</p>
                </div>
            </div>
            <div className={f['footer-bottom']}>
                <p className={f['copyright']}>© Since 2016 Bread Kitchen</p>
            </div>
        </div>
    </footer>
  );
}

export default Footer;
