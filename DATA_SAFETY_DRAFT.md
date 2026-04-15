# Google Play Data Safety Draft - Pomodoom

This draft is based on the current codebase behavior.

## App Profile
- Audience: 13+
- Ads: No
- User account required: No
- Data encrypted in transit: Not applicable for local-only flows in this release
- Data deletion request mechanism: In-app Clear All Data

## Data Collected
### App Activity / App Info and Performance
- Session timing and usage counters
- Purpose: App functionality and user-visible statistics
- Handling: Stored locally on device

### User-Generated Content
- To-do task text
- Optional session notes
- Purpose: Core app functionality
- Handling: Stored locally on device

### App Settings / Preferences
- Focus duration, break duration, penalty mode, sound and vibration toggles
- Purpose: Core app functionality and personalization
- Handling: Stored locally on device

## Data Sharing
- Data is not sold
- Data is not shared with third-party advertisers

## Notes for Console Submission
- Keep category as Productivity
- Complete IARC questionnaire before production rollout
- Ensure Privacy Policy URL points to the hosted version of PRIVACY_POLICY.md content
