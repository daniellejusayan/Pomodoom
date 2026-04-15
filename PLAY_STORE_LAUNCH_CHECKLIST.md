# Play Store Launch Checklist

## Done
- [x] Android package set to `com.pomodoom.app`
- [x] Android `versionCode` added
- [x] EAS build config added for production AAB
- [x] Native Analytics initialization disabled
- [x] Firebase config can be overridden with Expo public env vars
- [x] Firebase Hosting path exists for web assets / privacy policy
- [x] Support email provided: 6731503051@lamduan.mfu.ac.th
- [x] Publisher display name provided: Danielle Jusayan
- [x] Publisher address provided: Mae Fah Luang University, Chiang Rai
- [x] In-app Clear All Data control added in Settings

## Still Needed Before Submission
- [x] App icon candidate generated at `assets/playstore-icon-512.png` (512x512)
- [ ] Feature graphic: 1024x500
- [ ] Phone screenshots: at least 2
- [x] Short description drafted in `PLAY_STORE_LISTING_COPY.md`
- [x] Full description drafted in `PLAY_STORE_LISTING_COPY.md`
- [x] Support email
- [x] Publisher display name
- [x] Publisher physical address
- [ ] Privacy policy URL
- [x] Privacy policy draft created in `PRIVACY_POLICY.md`
- [x] Play Console Data safety draft created in `DATA_SAFETY_DRAFT.md`
- [ ] IARC content rating
- [ ] Final app category
- [ ] Internal testing AAB uploaded and verified

## Input Needed From You
Please send:
- Final 1024x500 feature graphic
- Final phone screenshots
- Confirmation on the final Play category (recommended: Productivity)
- Confirmation on whether to include cloud sync wording now or in a later release

## Notes
- Target API is explicitly pinned to 34 via Expo build properties.
- If Play Console later requires a higher target API, we can raise it in the same config file before release.
- Build output should be Android App Bundle (`.aab`), not APK.
