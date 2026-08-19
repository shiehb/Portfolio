// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    User
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBg5rK0gVHLlhg795BAhI_IqViNupl9To4",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "portfolio-projects-e34e6.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "portfolio-projects-e34e6",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "portfolio-projects-e34e6.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "722886671876",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:722886671876:web:527e1e95496c8dbd6b7f51"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.setCustomParameters({
    prompt: 'select_account'
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
    onAuthSuccess?: (user: User, token: string) => void,
    onAuthFailure?: () => void
) => {
    return onAuthStateChanged(auth, async (user: User | null) => {
        if (user) {
            if (cachedAccessToken) {
                if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
            } else if (!isSigningIn) {
                if (onAuthFailure) onAuthFailure();
            }
        } else {
            cachedAccessToken = null;
            if (onAuthFailure) onAuthFailure();
        }
    });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
    try {
        isSigningIn = true;
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (!credential?.accessToken) {
            throw new Error('Failed to get Google Drive access token from authentication.');
        }

        cachedAccessToken = credential.accessToken;
        return { user: result.user, accessToken: cachedAccessToken };
    } catch (error) {
        console.error('Google Drive sign-in error:', error);
        throw error;
    } finally {
        isSigningIn = false;
    }
};

export const getAccessToken = async (): Promise<string | null> => {
    return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
    cachedAccessToken = token;
};

export const logout = async () => {
    await signOut(auth);
    cachedAccessToken = null;
};
