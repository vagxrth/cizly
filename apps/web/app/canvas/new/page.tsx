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
    setCanvasData(prev => ({
      ...prev,
      [name]: value
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

        <div className={styles.dimensionsGroup}>
          <div className={styles.formGroup}>
            <label htmlFor="width">Width (px)</label>
            <input
              type="number"
              id="width"
              name="width"
              value={canvasData.width}
              onChange={handleChange}
              min="100"
              max="3000"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="height">Height (px)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={canvasData.height}
              onChange={handleChange}
              min="100"
              max="3000"
              required
            />
          </div>
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