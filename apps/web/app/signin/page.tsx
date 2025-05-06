'use client'
import styles from "./signin.module.css";
import Link from "next/link";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Failed to sign in');
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your Çizly account</p>
          
          {error && <div className={styles.error}>{error}</div>}
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <div className={styles.forgotPassword}>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>
            
            <button type="submit" className={styles.submitButton}>
              Sign In
            </button>
          </form>
          
          <p className={styles.signup}>
            Don't have an account?{" "}
            <Link href="/signup">Sign up</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
