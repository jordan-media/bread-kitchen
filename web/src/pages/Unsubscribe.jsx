// Unsubscribe.jsx - Unsubscribe from newsletter
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styles from './Unsubscribe.module.css';

const API_URL = 'http://localhost:3001';

export default function Unsubscribe() {
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
                    <p>Processing...</p>
                )}

                {status === 'confirm' && (
                    <>
                        <h2>Unsubscribe</h2>
                        <p>Are you sure you want to unsubscribe <strong>{email}</strong> from our newsletter?</p>
                        <p className={styles.note}>You will no longer receive weekly bread updates.</p>
                        <div className={styles.actions}>
                            <button onClick={handleUnsubscribe} className={styles.btnConfirm}>
                                Yes, Unsubscribe
                            </button>
                            <Link to="/" className={styles.btnCancel}>
                                Cancel
                            </Link>
                        </div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <h2>Unsubscribed</h2>
                        <p>You have been successfully unsubscribed from our newsletter.</p>
                        <p className={styles.note}>We're sorry to see you go!</p>
                        <Link to="/" className={styles.btnHome}>
                            Return to Homepage
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h2>Error</h2>
                        <p>Something went wrong. The link may be invalid or expired.</p>
                        <p className={styles.note}>If you need help, please contact us.</p>
                        <Link to="/" className={styles.btnHome}>
                            Return to Homepage
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
