import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Çizly</h1>
          <p className={styles.subtitle}>Your creative journey begins here</p>
          
          <div className={styles.ctas}>
            <Link href="/signin" className={styles.primary}>
              Sign In
            </Link>
            <Link href="/signup" className={styles.secondary}>
              Sign Up
            </Link>
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
        <p>© 2024 Çizly. All rights reserved.</p>
      </footer>
    </div>
  );
}
