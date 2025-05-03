interface AuthProps {
  isSignIn: boolean;
}

const Auth = ({ isSignIn }: AuthProps) => {
  return <div>
    <h1>Auth</h1>
    <form>
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button type="submit">{isSignIn ? "Sign In" : "Sign Up"}</button>
    </form>
  </div>;
};

export default Auth;
