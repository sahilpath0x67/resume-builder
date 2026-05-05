// src/lib/userStore.ts
// All Firestore read/write helpers for user data

import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ResumeOutput } from './types';

// ── Types ────────────────────────────────────────────────────────────────────
export interface SavedCV {
  id: string;
  name: string;
  resume: ResumeOutput;
  coverLetter?: string;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  isPro: boolean;
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: string; // 'active' | 'canceled' | 'past_due'
  createdAt: number;
  cvs: SavedCV[];
}

// ── Create user doc on first sign-in ─────────────────────────────────────────
export async function createUserProfile(uid: string, email: string, displayName: string) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      email,
      displayName,
      isPro: false,
      createdAt: Date.now(),
      cvs: [],
    });
  }
}

// ── Read user profile ─────────────────────────────────────────────────────────
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

// ── Save / update a CV ────────────────────────────────────────────────────────
export async function saveCV(uid: string, cv: SavedCV) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const profile = snap.data() as UserProfile;
  const existing = profile.cvs || [];
  const idx = existing.findIndex((c: SavedCV) => c.id === cv.id);

  let updated: SavedCV[];
  if (idx >= 0) {
    updated = [...existing];
    updated[idx] = { ...cv, updatedAt: Date.now() };
  } else {
    updated = [...existing, { ...cv, updatedAt: Date.now() }];
  }

  await updateDoc(ref, { cvs: updated });
}

// ── Delete a CV ───────────────────────────────────────────────────────────────
export async function deleteCV(uid: string, cvId: string) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const profile = snap.data() as UserProfile;
  const updated = (profile.cvs || []).filter((c: SavedCV) => c.id !== cvId);
  await updateDoc(ref, { cvs: updated });
}

// ── Mark user as Pro (called from Stripe webhook) ─────────────────────────────
export async function setUserPro(uid: string, isPro: boolean, subscriptionId?: string, stripeCustomerId?: string) {
  await updateDoc(doc(db, 'users', uid), {
    isPro,
    subscriptionId: subscriptionId ?? null,
    stripeCustomerId: stripeCustomerId ?? null,
    subscriptionStatus: isPro ? 'active' : 'canceled',
  });
}