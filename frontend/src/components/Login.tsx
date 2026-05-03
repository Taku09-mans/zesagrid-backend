import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [user, setUser] = useState(auth.currentUser);

  React.useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => signOut(auth);

  if (user) {
    return (
      <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#F27D26] flex items-center justify-center">
          {user.photoURL ? (
            <img src={user.photoURL} alt="profile" />
          ) : (
            <UserIcon size={16} className="text-black" />
          )}
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-semibold text-white truncate max-w-[120px]">{user.displayName || 'User'}</p>
          <button onClick={handleLogout} className="text-[10px] text-zinc-500 hover:text-white uppercase font-mono">Secure_Logout</button>
        </div>
        <button onClick={handleLogout} className="md:hidden text-zinc-500">
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleLogin}
      className="flex items-center gap-2 bg-[#F27D26] text-black font-bold px-5 py-2.5 rounded-xl transition-colors hover:bg-[#d86d1f]"
    >
      <LogIn size={18} />
      <span>IDENTITY_LOGIN</span>
    </motion.button>
  );
}
