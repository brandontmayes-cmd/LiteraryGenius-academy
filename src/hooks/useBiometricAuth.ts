import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    checkAvailability();
    checkRegistration();
  }, []);

  const checkAvailability = async () => {
    const available = window.PublicKeyCredential !== undefined &&
      await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    setIsAvailable(available);
  };

  const checkRegistration = () => {
    const registered = localStorage.getItem('biometric_registered') === 'true';
    setIsRegistered(registered);
  };

  const register = async (userId: string, email: string) => {
    if (!isAvailable) throw new Error('Biometric auth not available');

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: { name: 'Literary Genius Academy', id: window.location.hostname },
      user: {
        id: new TextEncoder().encode(userId),
        name: email,
        displayName: email
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required'
      },
      timeout: 60000,
      attestation: 'none'
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions
    }) as PublicKeyCredential;

    localStorage.setItem('biometric_registered', 'true');
    localStorage.setItem('biometric_credential_id', btoa(String.fromCharCode(...new Uint8Array(credential.rawId))));
    setIsRegistered(true);

    return credential;
  };

  const authenticate = async () => {
    if (!isAvailable || !isRegistered) throw new Error('Biometric auth not available');

    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const credentialId = localStorage.getItem('biometric_credential_id');
    if (!credentialId) throw new Error('No credential found');

    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: [{
        id: Uint8Array.from(atob(credentialId), c => c.charCodeAt(0)),
        type: 'public-key'
      }],
      timeout: 60000,
      userVerification: 'required'
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyOptions
    });

    return assertion;
  };

  return { isAvailable, isRegistered, register, authenticate };
};
