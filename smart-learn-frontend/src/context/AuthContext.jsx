import { createContext, useEffect, useMemo, useState } from 'react';
import {
  loginWithEmail,
	loginWithGoogle,
	linkGoogleAccount,
	completePendingGoogleLink,
  logoutUser,
  registerWithEmail,
  subscribeToAuth,
} from '../services/firebaseAuth';

export const AuthContext = createContext({
	isAuthenticated: false,
	user: null,
	isAuthLoading: true,
	login: async () => {},
	loginWithGoogle: async () => {},
	linkGoogleAccount: async () => {},
	register: async () => {},
	logout: async () => {},
});

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [isAuthLoading, setIsAuthLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = subscribeToAuth((nextUser) => {
			setUser(nextUser);
			setIsAuthLoading(false);
		});

		return () => unsubscribe();
	}, []);

	const login = async (email, password, rememberMe = true) => {
		const nextUser = await loginWithEmail(email, password, rememberMe);
		let linkedUser = null;
		try {
			linkedUser = await completePendingGoogleLink();
		} catch {
			linkedUser = null;
		}
		setUser(linkedUser || nextUser);
		return linkedUser || nextUser;
	};

	const linkGoogleAccountToCurrentUser = async (rememberMe = true) => {
		const nextUser = await linkGoogleAccount(rememberMe);
		setUser(nextUser);
		return nextUser;
	};

	const loginWithGoogleAccount = async (rememberMe = true) => {
		const nextUser = await loginWithGoogle(rememberMe);
		setUser(nextUser);
		return nextUser;
	};

	const register = async (email, password, rememberMe = true) => {
		const nextUser = await registerWithEmail(email, password, rememberMe);
		let linkedUser = null;
		try {
			linkedUser = await completePendingGoogleLink();
		} catch {
			linkedUser = null;
		}
		setUser(linkedUser || nextUser);
		return linkedUser || nextUser;
	};

	const logout = async () => {
		await logoutUser();
		setUser(null);
	};

	const value = useMemo(
		() => ({
			isAuthenticated: Boolean(user),
			user,
			isAuthLoading,
			login,
			loginWithGoogle: loginWithGoogleAccount,
			linkGoogleAccount: linkGoogleAccountToCurrentUser,
			register,
			logout,
		}),
		[user, isAuthLoading]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
