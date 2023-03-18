---
title: 'changelog'
date: 2017-12-19
lastmod: 2023-03-12
lastfetch: 2023-03-18T12:42:12.984Z
url: opensource/armadillo/changelog
showSummary: false
showTableOfContents: false
type: opensource-additional
---
# Releases

## v1.0.0

* migrate to AndroidX (thx @marukami and special thx @davidmigloz)
* update AGP and Gradle

### Breaking Change: Change of transitive dependencies from `api` to `implementation`

If you are using code of any of the following libraries as transitive dependencies through this lib:

* `at.favre.lib:hkdf`
* `at.favre.lib:bytes`
* `at.favre.lib:bcrypt`
* `com.jakewharton.timber:timber`

your build may break and you have to add the dependency manually to your build. The reason is, that
I changed the scope of these to `implementation`. See https://docs.gradle.org/current/userguide/java_library_plugin.html#:~:text=The%20api%20configuration%20should%20be,are%20internal%20to%20the%20component.

> [Full changelog](https://github.com/patrickfav/armadillo/compare/v0.11.0...v1.0.0)

## v0.11.0

* improve AES-GCM decryption logic

> [Full changelog](https://github.com/patrickfav/armadillo/compare/v0.10.0...v0.11.0)

## v0.10.0

* use fallback if ANDROID_ID returns null #49
* update AGP and some libs (bcrypt & hkdf)
* update to checkstyle 8.31

> [Full changelog](https://github.com/patrickfav/armadillo/compare/v0.9.0...v0.10.0)

## v0.9.0

* add wiping of pw cache to close() method in SecureSharedPreferences
* increase internal optional password cache to 12 from 8
* add shared preference listener feature which works with unencrypted data #47 (thx @davidgarciaanton)
* update AGP, target SDK to 29 and several internal dependencies

> [Full changelog](https://github.com/patrickfav/armadillo/compare/v0.8.0...v0.9.0)

## v0.8.0

* Fixed an issue when getting and setting values from different threads in parallel #41

> [Full changelog](https://github.com/patrickfav/armadillo/compare/v0.7.0...v0.8.0)

## v0.7.0

* Improve derive user password memory protection #32
* Add derived password cache to speed up consecutive .get() calls #32
* Improve RecoveryPolicy #35

> [Full changelog](https://github.com/patrickfav/armadillo/compare/v0.6.0...v0.7.0)

### Breaking Change: RecoveryPolicy Interface

The `RecoveryPolicy` interface changed to include a more flexible handle method.
If you used the old one just change:

```java
new RecoveryPolicy.Default(true, false);
```

to

```java
new SimpleRecoveryPolicy.Default(true, false);
```

What was `RecoveryPolicy` is now `SimpleRecoveryPolicy`.

## v0.6.0

* [Security] Fix bcrypt implementation #16, #8
* [Security] Add full Kitkat support #6, #31
* Add change password feature #13, #22
* Add change key stretching feature #16

> [Full changelog](https://github.com/patrickfav/armadillo/compare/v0.5.0...v0.6.0)

### Breaking Change: Bcrypt Implementation

In the old bcrypt implementation the following issues were found (#16):

 * only uses max 36 bytes entropy of the possible 72 bytes allowed by bcrypt
 * only uses 11 byte entropy of the 16 byte possible salt

These issue limit the security strength of the KDF severely
and immediate update is recommended.

The security fix unfortunately introduced some non-backwards compatible
changes. Migration will **only** be needed if:

* a user password was used previously
* the default keyStretchingFunction() was used (ie. using the default config)

Updating the library will instantly make your data incompatible in this case.
 Please follow the migration steps below:

#### Migration

1. Set the old bcrypt key stretching function, renamed to `BrokenBcryptKeyStretcher`,
so the lib will be again able to read the data:

```java
    SharedPreferences preferences = Armadillo.create(context, ...)
                ...
                .password(myPassword);
                .keyStretchingFunction(new BrokenBcryptKeyStretcher()).build();
```

2. Use the change password feature to set the new fixed implementation. For
this to work the user password is required. If you don't want the password
to change use the same one:

```java
    preferences.changePassword(myPassword, new ArmadilloBcryptKeyStretcher());
```

And that's basically it. From now on you won't need to set the
`keyStretchingFunction()` any more. Note, that changing the password, is
a very slow process, because it involves, decrypting and re-encrypting all
values in the preference store (it is transactional).

I recommend setting a migration flag in a non-encrypted `SharedPreference`
and migrate the next time the user has to enter the password (this process
should be in background task anyway, so it should only take a bit longer
to decrypt for the user)

## v0.5.0 (11/07/18) - Important Security Fix

* [Security] A user provided password was NOT used for the creation of the secret key #11 (thx @davidmigloz) 
* Various small fixes cleaning memory from security relevant data (internal keys, salts, etc.)
* Fix minSdk to be 19 instead of 21
* New logo (thx @iqbalhood)

> [Full changelog](https://github.com/patrickfav/armadillo/compare/v0.4.3...v0.5.0)

### Known Issues

* Currently the AES mode GCM does not work correctly on Kitkat, working on a fix
* Currently migration is needed if user password was used (will add a migration guide later)

**Note:** If you are using 0.4.x of armadillo, the user password will not encrypt the data. Please update ASAP, but mind that this might make data inaccessible. I will be working on a workaround/migration guide. (see #11)

## v0.4.3 (14/06/18)

* Better exception clean up with resources and some byte wipe

> [Full changelog](https://github.com/patrickfav/armadillo/compare/v0.4.2...v0.4.3)

**Note:** This release has a known security issue relating to the user password not correctly used during encryption (see #11). Do not use this release and migrate to 0.5+ ASAP.

## v0.4.2 (20/04/18)

* Supporting `null` in `.putString()` and `.putStringSet()`; same as calling `remove()` as per API spec

> [Full changelog](https://github.com/patrickfav/armadillo/compare/v0.4.1...v0.4.2)

## v0.4.1 (20/04/18)

* Fixes missing using incorrect dependency type '.aar'

> [Full changelog](https://github.com/patrickfav/armadillo/compare/v0.4.0...v0.4.1)

## v0.4.0 (28/03/18)

* Fixes missing transitive dependency in pom

> [Full changelog](https://github.com/patrickfav/armadillo/compare/v0.3.0...v0.4.0)

**Note:** This release has a bug in the pom dependency file.

## v0.3.0 (08/01/18)

* Add compressor feature
* Fixes issue were storage salt was incorrectly created

> [Full changelog](https://github.com/patrickfav/armadillo/compare/v0.2.0...v0.3.0)

**Note:** misses transitive dependencies.

## v0.2.0 (03/01/18)

* Add authenticated encryption additional associated data
* Add crypto protocol version

> [Full changelog](https://github.com/patrickfav/armadillo/compare/eedc283f0b8e1b658d01afd2a9d9b3dedac0fd33...v0.2.0)

**Note:** This version has fatal flaw not correctly persisting the storage random making it impossible to retrieve the data after recreating the shared preferences.

## v0.1.0 (19/12/17)

* Initial release
