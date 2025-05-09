'use client';

import { useEffect, useState } from 'react';
import styles from './dashboard.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Canvas {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCanvases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);
  const fetchCanvases = async () => {
    try {
      const response = await fetch('/api/canvas');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/signin');
          return;
        }
        throw new Error('Failed to fetch canvases');
      }

      const data = await response.json();
      setCanvases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load canvases');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading...
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1>My Canvases</h1>
        <Link href="/canvas/new" className={styles.createButton}>
          Create New Canvas
        </Link>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <main className={styles.main}>
        {canvases.length === 0 ? (
          <div className={styles.emptyState}>
            <p>You haven&apos;t created any canvases yet.</p>
            <Link href="/canvas/new" className={styles.createButton}>
              Create your first canvas
            </Link>
          </div>
        ) : (
          <div className={styles.canvasGrid}>
            {canvases.map((canvas) => (
              <Link
                key={canvas.id}
                href={`/canvas/${canvas.id}`}
                className={styles.canvasCard}
              >
                <div className={styles.canvasPreview}>
                  {/* Preview thumbnail will go here */}
                </div>
                <div className={styles.canvasInfo}>
                  <h3>{canvas.title}</h3>
                  {canvas.description && (
                    <p className={styles.description}>{canvas.description}</p>
                  )}
                  <p className={styles.date}>
                    Created: {new Date(canvas.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 