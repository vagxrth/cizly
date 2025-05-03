'use client';
interface AuthProps {
  isSignIn: boolean;
}

const Auth = ({ isSignIn }: AuthProps) => {
  const handleSubmit = () => {
    
  }
  
  return <div>
    <h1>Auth</h1>
    <form>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button onClick={handleSubmit} type="submit">{isSignIn ? "Sign In" : "Sign Up"}</button>
    </form>
  </div>;
};

export default Auth;
