---
title: 'Snippet: Using Android KeyStore to generate a password'
date: 2016-09-21
lastmod: 2016-09-21
lastfetch: 2023-03-13T17:18:00.964Z
description: 'Using Android KeyStore to generate a password. The code create a public/private key pair and uses the base64 encoded form of the certificate to as the password. The code modified the KeystoreHelper class from AOSP demo projects.'
summary: 'Using Android KeyStore to generate a password. The code create a public/private key pair and uses the base64 encoded form of the certificate to as the password. The code modified the KeystoreHelper class from AOSP demo projects.'
aliases: [/link/fzcrqguf]
slug: 2016/using-android-keystore-to-generate-a-password
tags: ["Java"]
keywords: ["Java"]
alltags: ["Java"]
categories: ["opensource"]
type: gist
showTableOfContents: false
showTaxonomies: false
thumbnail: 'gistbanner*'
editURL: https://gist.github.com/70a41a7ddf6e6efebf1756639fc86762
deeplink: /link/fzcrqguf
originalContentLink: https://gist.github.com/70a41a7ddf6e6efebf1756639fc86762
originalContentType: gist
gistLanguage: Java
gistFileCount: 3
gistComments: 0
gistCommentsUrl: https://api.github.com/gists/70a41a7ddf6e6efebf1756639fc86762/comments
---

### KeyStoreHelper.java

```Java
/*
 * Copyright 2013 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import android.annotation.TargetApi;
import android.content.Context;
import android.os.Build;
import android.security.KeyPairGeneratorSpec;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import android.util.Log;

import java.math.BigInteger;
import java.security.InvalidAlgorithmParameterException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.RSAKeyGenParameterSpec;
import java.util.Calendar;
import java.util.GregorianCalendar;

import javax.crypto.Cipher;
import javax.crypto.NoSuchPaddingException;
import javax.security.auth.x500.X500Principal;

import static java.security.spec.RSAKeyGenParameterSpec.F4;

public class KeyStoreHelper {

    public static final String TAG = "KeyStoreHelper";

    /**
     * Creates a public and private key and stores it using the Android Key
     * Store, so that only this application will be able to access the keys.
     */
    public static void createKeys(Context context, String alias) throws NoSuchProviderException,
            NoSuchAlgorithmException, InvalidAlgorithmParameterException {
        if (!isSigningKey(alias)) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                createKeysM(alias, false);
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
                createKeysJBMR2(context, alias);
            }
        }
    }


    @TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR2)
    static void createKeysJBMR2(Context context, String alias) throws NoSuchProviderException,
            NoSuchAlgorithmException, InvalidAlgorithmParameterException {

        Calendar start = new GregorianCalendar();
        Calendar end = new GregorianCalendar();
        end.add(Calendar.YEAR, 30);

        KeyPairGeneratorSpec spec = new KeyPairGeneratorSpec.Builder(context)
                // You'll use the alias later to retrieve the key. It's a key
                // for the key!
                .setAlias(alias)
                .setSubject(new X500Principal("CN=" + alias))
                .setSerialNumber(BigInteger.valueOf(Math.abs(alias.hashCode())))
                // Date range of validity for the generated pair.
                .setStartDate(start.getTime()).setEndDate(end.getTime())
                .build();

        KeyPairGenerator kpGenerator = KeyPairGenerator.getInstance(
                SecurityConstants.TYPE_RSA,
                SecurityConstants.KEYSTORE_PROVIDER_ANDROID_KEYSTORE);
        kpGenerator.initialize(spec);
        KeyPair kp = kpGenerator.generateKeyPair();
        Log.d(TAG, "Public Key is: " + kp.getPublic().toString());

    }

    @TargetApi(Build.VERSION_CODES.M)
    static void createKeysM(String alias, boolean requireAuth) {
        try {
            KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(
                    KeyProperties.KEY_ALGORITHM_RSA, SecurityConstants.KEYSTORE_PROVIDER_ANDROID_KEYSTORE);
            keyPairGenerator.initialize(
                    new KeyGenParameterSpec.Builder(
                            alias,
                            KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                            .setAlgorithmParameterSpec(new RSAKeyGenParameterSpec(1024, F4))
                            .setBlockModes(KeyProperties.BLOCK_MODE_CBC)
                            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_RSA_PKCS1)
                            .setDigests(KeyProperties.DIGEST_SHA256,
                                    KeyProperties.DIGEST_SHA384,
                                    KeyProperties.DIGEST_SHA512)
                            // Only permit the private key to be used if the user authenticated
                            // within the last five minutes.
                            .setUserAuthenticationRequired(requireAuth)
                            .build());
            KeyPair keyPair = keyPairGenerator.generateKeyPair();
            Log.d(TAG, "Public Key is: " + keyPair.getPublic().toString());

        } catch (NoSuchProviderException | NoSuchAlgorithmException | InvalidAlgorithmParameterException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * JBMR2+ If Key with the default alias exists, returns true, else false.
     * on pre-JBMR2 returns true always.
     */
    public static boolean isSigningKey(String alias) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            try {
                KeyStore keyStore = KeyStore.getInstance(SecurityConstants.KEYSTORE_PROVIDER_ANDROID_KEYSTORE);
                keyStore.load(null);
                return keyStore.containsAlias(alias);
            } catch (Exception e) {
                Log.e(TAG, e.getMessage(), e);
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * Returns the private key signature on JBMR2+ or else null.
     */
    public static String getSigningKey(String alias) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN_MR2) {
            Certificate cert = getPrivateKeyEntry(alias).getCertificate();
            if (cert == null) {
                return null;
            }
            return Base64.encodeToString(cert.getEncoded(), Base64.NO_WRAP);
        } else {
            return null;
        }
    }

    private static KeyStore.PrivateKeyEntry getPrivateKeyEntry(String alias) {
        try {
            KeyStore ks = KeyStore
                    .getInstance(SecurityConstants.KEYSTORE_PROVIDER_ANDROID_KEYSTORE);
            ks.load(null);
            KeyStore.Entry entry = ks.getEntry(alias, null);

            if (entry == null) {
                Log.w(TAG, "No key found under alias: " + alias);
                Log.w(TAG, "Exiting signData()...");
                return null;
            }

            if (!(entry instanceof KeyStore.PrivateKeyEntry)) {
                Log.w(TAG, "Not an instance of a PrivateKeyEntry");
                Log.w(TAG, "Exiting signData()...");
                return null;
            }
            return (KeyStore.PrivateKeyEntry) entry;
        } catch (Exception e) {
            Log.e(TAG, e.getMessage(), e);
            return null;
        }
    }

    public static String encrypt(String alias, String plaintext) {
        try {
            PublicKey publicKey = getPrivateKeyEntry(alias).getCertificate().getPublicKey();
            Cipher cipher = getCipher();
            cipher.init(Cipher.ENCRYPT_MODE, publicKey);
            return Base64.encodeToString(cipher.doFinal(plaintext.getBytes()), Base64.NO_WRAP);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static String decrypt(String alias, String ciphertext) {
        try {
            PrivateKey privateKey = getPrivateKeyEntry(alias).getPrivateKey();
            Cipher cipher = getCipher();
            cipher.init(Cipher.DECRYPT_MODE, privateKey);
            return new String(cipher.doFinal(Base64.decode(ciphertext, Base64.NO_WRAP)));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static Cipher getCipher() throws NoSuchPaddingException, NoSuchAlgorithmException {
        return Cipher.getInstance(
                String.format("%s/%s/%s",
                        SecurityConstants.TYPE_RSA,
                        SecurityConstants.BLOCKING_MODE,
                        SecurityConstants.PADDING_TYPE));
    }

    public interface SecurityConstants {
        String KEYSTORE_PROVIDER_ANDROID_KEYSTORE = "AndroidKeyStore";
        String TYPE_RSA = "RSA";
        String PADDING_TYPE = "PKCS1Padding";
        String BLOCKING_MODE = "NONE";

        String SIGNATURE_SHA256withRSA = "SHA256withRSA";
        String SIGNATURE_SHA512withRSA = "SHA512withRSA";
    }

}
```

### UsageAndroidEncryption.java

```Java
/**
 * This will only for for Android 4.3+.
 * if you need support for older devices, I suggest 
 * using SecurePreferences library
 */
String encrypted = KeyStoreHelper.encrypt(KEYSTORE_KEY_ALIAS, "Hello World");
String decrypted = KeyStoreHelper.decrypt(KEYSTORE_KEY_ALIAS, encrypted);
```

### UsageUsingSecurePreferences.java

```Java
try {
    //This will only create a certificate once as it checks
    //internally whether a certificate with the given name
    //already exists.
    KeyStoreHelper.createKeys(context, KEYSTORE_PASSWORD.name());
} catch (Exception e) {
    //Probably will never happen.
    throw new RuntimeException(e);
}
String pass = KeyStoreHelper.getSigningKey(KEYSTORE_PASSWORD.name());
if (pass == null) {
  //This is a device less than JBMR2 or something went wrong.
  //I recommend eitehr not supporting it or fetching device hardware ID as shown below.
  //do note this is barely better than obfuscation. 
  //Compromised security but may prove to be better than nothing
  pass = getDeviceSerialNumber(context)
  //bitshift everything by some pre-determined amount for added seurity
  pass = bitshiftEntireString(pass);
}
SharedPreferences securePref = new SecurePreferences(context, pass, "monkey");

/**
 * Bitshift the entire string to obfuscate it further
 * and make it harder to guess the password.
 */
public static String bitshiftEntireString(String str) {
  StringBuilder msg = new StringBuilder(str);
  int userKey = 6;
  for (int i = 0; i < msg.length(); i ++) {
    msg.setCharAt(i, (char) (msg.charAt(i) + userKey));
  }
  return msg.toString();
}

/**
 * Gets the hardware serial number of this device.
 * 
 * @return serial number or Settings.Secure.ANDROID_ID if not available.
 * Credit: SecurePreferences for Android
 */
private static String getDeviceSerialNumber(Context context) {
	// We're using the Reflection API because Build.SERIAL is only available
	// since API Level 9 (Gingerbread, Android 2.3).
	try {
		String deviceSerial = (String) Build.class.getField("SERIAL").get(
				null);
		if (TextUtils.isEmpty(deviceSerial)) {
			return Settings.Secure.getString(
					context.getContentResolver(),
					Settings.Secure.ANDROID_ID);
		} else {
      return deviceSerial;
    }
	} catch (Exception ignored) {
		// Fall back  to Android_ID
		return Settings.Secure.getString(context.getContentResolver(),
				Settings.Secure.ANDROID_ID);
	}
}

```

