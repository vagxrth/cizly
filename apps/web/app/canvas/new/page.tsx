'use client'
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './new-canvas.module.css';

export default function NewCanvas() {
  const router = useRouter();
  const [canvasData, setCanvasData] = useState({
    title: '',
    description: '',
    width: 800,
    height: 600,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const parsedValue = e.target.type === 'number' ? parseInt(value, 10) : value;
    setCanvasData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/canvas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(canvasData),
      });

      if (response.ok) {
        const { id } = await response.json();
        router.push(`/canvas/${id}`);
      }
    } catch (error) {
      console.error('Failed to create canvas:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create New Canvas</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Canvas Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={canvasData.title}
            onChange={handleChange}
            placeholder="Enter canvas title"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            name="description"
            value={canvasData.description}
            onChange={handleChange}
            placeholder="Enter canvas description"
            rows={3}
          />
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={() => router.back()} className={styles.cancelButton}>
            Cancel
          </button>
          <button type="submit" className={styles.createButton}>
            Create Canvas
          </button>
        </div>
      </form>
    </div>
  );
} 