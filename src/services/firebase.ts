import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, User } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import firebaseAppletConfig from '../../firebase-applet-config.json';
import { FirebaseConfig } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize primary Firebase App with provisioned applet config
const primaryApp = getApps().length > 0 ? getApp() : initializeApp(firebaseAppletConfig);

// CRITICAL: The app will break without this line
export const db = getFirestore(primaryApp, firebaseAppletConfig.firestoreDatabaseId);
export const auth = getAuth(primaryApp);

// Sign in with Google Popup
export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

// Sign out
export async function signOutTeacher(): Promise<void> {
  await fbSignOut(auth);
}

// Connection test on boot as mandated by Firebase Skill
export async function testConnectionOnBoot(): Promise<boolean> {
  try {
    // Attempt getDocFromServer to verify live Firestore reachability
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline check: Please verify network or credentials.');
    }
    return false;
  }
}

// Expose active project ID and applet info
export function getFirebaseProjectInfo() {
  return {
    projectId: firebaseAppletConfig.projectId,
    databaseId: firebaseAppletConfig.firestoreDatabaseId,
    appId: firebaseAppletConfig.appId,
  };
}
