---
title: 'Snippet: Companion code to my article about AES+CBC with Encrypt-then-MAC.'
date: 2018-11-11
lastmod: 2023-02-25
lastfetch: 2023-03-13T17:17:57.616Z
description: 'Companion code to my article about AES+CBC with Encrypt-then-MAC.'
summary: 'Companion code to my article about AES+CBC with Encrypt-then-MAC.'
aliases: [/link/zer36gia]
slug: 2018/companion-code-to-my-article-about-aes-cbc-with-encrypt-then-mac
tags: ["Java"]
keywords: ["Java"]
alltags: ["Java"]
categories: ["opensource"]
type: gist
showTableOfContents: false
showTaxonomies: false
thumbnail: 'gistbanner*'
editURL: https://gist.github.com/b323f0d9cbd81d5fa9cc4c971b732c77
deeplink: /link/zer36gia
originalContentLink: https://gist.github.com/b323f0d9cbd81d5fa9cc4c971b732c77
originalContentType: gist
gistLanguage: Java
gistFileCount: 1
gistComments: 1
gistCommentsUrl: https://api.github.com/gists/b323f0d9cbd81d5fa9cc4c971b732c77/comments
---

### AesCbcExample.java

```Java
package at.favre.lib.armadillo;

import org.junit.Test;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import at.favre.lib.crypto.HKDF;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertFalse;

/**
 * Companion code to my article about AES+CBC with Encrypt-then-MAC
 */
public class AesCbcExample {

    private final SecureRandom secureRandom = new SecureRandom();

    @Test
    public void testEncryption() throws Exception {
        // create a random key
        SecureRandom secureRandom = new SecureRandom();
        byte[] key = new byte[16];
        secureRandom.nextBytes(key);

        // the possible plain text
        byte[] plainText = "A secret message we created.".getBytes(StandardCharsets.UTF_8);

        // data to add to the authentication tag - possibly protocol version
        byte[] aad = new byte[] {0x01, 0x02};

        byte[] cipherText = encrypt(key, plainText, aad);
        byte[] decrypted = decrypt(key, cipherText, aad);

        // plaintext and decrypted must be equal
        assertArrayEquals(plainText, decrypted);
        // plaintext must not be equal to cipher text
        assertFalse(Arrays.equals(plainText, cipherText));
    }

    /**
     * Encrpyt given plaintext with given key.
     *
     * @param key            must be strong 16, 24 or 32 byte secret key
     * @param plainText      to encrypt
     * @param associatedData optional data added to the authentication tag
     * @return encrypted message including mac & iv
     * @throws Exception
     */
    private byte[] encrypt(byte[] key, byte[] plainText, byte[] associatedData) throws Exception {
        byte[] iv = new byte[16];
        secureRandom.nextBytes(iv);

        byte[] encKey = HKDF.fromHmacSha256().expand(key, "encKey".getBytes(StandardCharsets.UTF_8), 16);
        byte[] authKey = HKDF.fromHmacSha256().expand(key, "authKey".getBytes(StandardCharsets.UTF_8), 32); //HMAC-SHA256 key is 32 byte

        final Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding"); //actually uses PKCS#7
        cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(encKey, "AES"), new IvParameterSpec(iv));
        byte[] cipherText = cipher.doFinal(plainText);

        SecretKey macKey = new SecretKeySpec(authKey, "HmacSHA256");
        Mac hmac = Mac.getInstance("HmacSHA256");
        hmac.init(macKey);
        hmac.update(iv);
        hmac.update(cipherText);

        if (associatedData != null) {
            hmac.update(associatedData);
        }

        byte[] mac = hmac.doFinal();

        ByteBuffer byteBuffer = ByteBuffer.allocate(1 + iv.length + 1 + mac.length + cipherText.length);
        byteBuffer.put((byte) iv.length);
        byteBuffer.put(iv);
        byteBuffer.put((byte) mac.length);
        byteBuffer.put(mac);
        byteBuffer.put(cipherText);
        byte[] cipherMessage = byteBuffer.array();

        Arrays.fill(authKey, (byte) 0);
        Arrays.fill(encKey, (byte) 0);

        return cipherMessage;
    }

    /**
     * Decrypt previously encrypted message with {@link #encrypt(byte[], byte[], byte[])}.
     *
     * @param key            same secret used during encrpytion
     * @param cipherMessage  the message returned by encrypt
     * @param associatedData optional data added to the authentication tag
     * @return the plain text
     * @throws Exception
     */
    private byte[] decrypt(byte[] key, byte[] cipherMessage, byte[] associatedData) throws Exception {
        ByteBuffer byteBuffer = ByteBuffer.wrap(cipherMessage);

        int ivLength = (byteBuffer.get());
        if (ivLength != 16) { // check input parameter
            throw new IllegalArgumentException("invalid iv length");
        }
        byte[] iv = new byte[ivLength];
        byteBuffer.get(iv);

        int macLength = (byteBuffer.get());
        if (macLength != 32) { // check input parameter
            throw new IllegalArgumentException("invalid mac length");
        }
        byte[] mac = new byte[macLength];
        byteBuffer.get(mac);

        byte[] cipherText = new byte[byteBuffer.remaining()];
        byteBuffer.get(cipherText);

        byte[] encKey = HKDF.fromHmacSha256().expand(key, "encKey".getBytes(StandardCharsets.UTF_8), 16);
        byte[] authKey = HKDF.fromHmacSha256().expand(key, "authKey".getBytes(StandardCharsets.UTF_8), 32);

        SecretKey macKey = new SecretKeySpec(authKey, "HmacSHA256");
        Mac hmac = Mac.getInstance("HmacSHA256");
        hmac.init(macKey);
        hmac.update(iv);
        hmac.update(cipherText);
        if (associatedData != null) {
            hmac.update(associatedData);
        }
        byte[] refMac = hmac.doFinal();

        if (!MessageDigest.isEqual(refMac, mac)) {
            throw new SecurityException("could not authenticate");
        }

        final Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(encKey, "AES"), new IvParameterSpec(iv));
        byte[] plainText = cipher.doFinal(cipherText);

        return plainText;
    }
}

```

