// Unsubscribe.jsx - Unsubscribe from newsletter
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styles from './Unsubscribe.module.css';
import { API_BASE_URL } from '../api';
import { useTranslation } from '../hooks/useTranslation';

const API_URL = API_BASE_URL;

export default function Unsubscribe() {
    const { t } = useTranslation('contact');
    const { t: tCommon } = useTranslation('common');

    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, confirm, success, error
    const [email, setEmail] = useState('');

    const token = searchParams.get('token');

    useEffect(() => {
        if (token) {
            // Decode token to show email
            try {
                const decoded = atob(token);
                setEmail(decoded);
                setStatus('confirm');
            } catch {
                setStatus('error');
            }
        } else {
            setStatus('error');
        }
    }, [token]);

    const handleUnsubscribe = async () => {
        setStatus('loading');

        try {
            const res = await fetch(`${API_URL}/admin/unsubscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            const data = await res.json();

            if (data.success) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.box}>
                <h1>Bread Kitchen</h1>

                {status === 'loading' && (
                    <p>{tCommon('buttons.loading')}</p>
                )}

                {status === 'confirm' && (
                    <>
                        <h2>{t('unsubscribe.title')}</h2>
                        <p>{t('unsubscribe.confirm')} <strong>{email}</strong>?</p>
                        <p className={styles.note}>{t('unsubscribe.note')}</p>
                        <div className={styles.actions}>
                            <button onClick={handleUnsubscribe} className={styles.btnConfirm}>
                                {t('unsubscribe.button')}
                            </button>
                            <Link to="/" className={styles.btnCancel}>
                                {t('unsubscribe.cancel')}
                            </Link>
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <h2>{t('unsubscribe.successTitle')}</h2>
                        <p>{t('unsubscribe.successMessage')}</p>
                        <p className={styles.note}>{t('unsubscribe.successNote')}</p>
                        <Link to="/" className={styles.btnHome}>
                            {tCommon('buttons.returnHome')}
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h2>{t('unsubscribe.errorTitle')}</h2>
                        <p>{t('unsubscribe.errorMessage')}</p>
                        <p className={styles.note}>{t('unsubscribe.errorNote')}</p>
                        <Link to="/" className={styles.btnHome}>
                            {tCommon('buttons.returnHome')}
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
