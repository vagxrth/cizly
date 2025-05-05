import styles from "./signup.module.css";
import Link from "next/link";

export default function SignUp() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.formContainer}>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join Çizly and start your journey</p>
          
          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                placeholder="Enter your full name"
                required
              />
            </div>

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
                placeholder="Create a password"
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <button type="submit" className={styles.submitButton}>
              Create Account
            </button>
          </form>
          
          <p className={styles.signin}>
            Already have an account?{" "}
            <Link href="/signin">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
