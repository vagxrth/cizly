import styles from "./signin.module.css";
import Link from "next/link";

export default function SignIn() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your Çizly account</p>
          
          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                required
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
