'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface AuthProps {
  isSignIn: boolean;
}

const Auth = ({ isSignIn }: AuthProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isSignIn ? '/signin' : '/signup';
      const response = await axios.post(`http://localhost:3001${endpoint}`, {
        username,
        password,
      });
      
      if (response.data.token) {
        // Store the token
        localStorage.setItem('token', response.data.token);
        // Redirect to canvas page
        router.push('/canvas/test');
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isSignIn ? "Sign In" : "Sign Up"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            {isSignIn ? "Sign In" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
