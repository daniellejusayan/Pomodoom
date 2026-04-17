# Pomodoom

Pomodoom is a focus timer app built with Expo and React Native. It combines Pomodoro-style sessions with accountability features, session statistics, guided onboarding, and local task tracking so you can stay focused without losing your progress.

## What It Does

- Start focus sessions, short breaks, and long breaks from a single timer flow.
- Choose how strict interruptions should be with penalty modes like Warning, Reset Timer, Add Time, and Lock Mode.
- Track completed sessions, interruptions, and long breaks in a statistics dashboard.
- Manage a lightweight to-do list alongside the timer.
- Replay onboarding and in-app tutorials whenever you need a refresher.
- Store all app data locally on the device, with a built-in option to clear everything.

## Screens And Features

- Onboarding with a guided introduction to the app.
- Home timer with focus, break, and long-break states.
- Penalty system for pause, stop, and background interruptions.
- Statistics view with weekly and daily focus charts.
- Settings for durations, sound, vibration, and penalty style.
- Local data controls for resetting onboarding, tutorials, sessions, settings, and tasks.

## Tech Stack

- Expo
- React Native
- TypeScript
- React Navigation
- AsyncStorage
- Firebase initialization for future cloud-ready features
- Expo AV, Haptics, Linear Gradient, and SVG support

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- Expo Go, Android Studio, or Xcode depending on the platform you want to run

### Install

```bash
npm install
```

### Run Locally

```bash
npm start
```

From there you can open the app on the platform of your choice.

### Platform Commands

```bash
npm run android
npm run ios
npm run web
```

If you want tunnel mode for device testing:

```bash
npm run start:tunnel
```

## Available Scripts

- `npm start` - start the Expo dev server.
- `npm run android` - launch on Android.
- `npm run ios` - launch on iOS.
- `npm run web` - run the web build locally.
- `npm run build:web` - export the web build into `web-build/` and copy the privacy policy.
- `npm run deploy:hosting` - build the web app and deploy to Firebase Hosting.
- `npm run build:android` - create a production Android build with EAS.
- `npm run build:android:preview` - create a preview Android build with EAS.
- `npm run submit:android` - submit the Android build through EAS.
- `npm run version:bump:patch` - bump the patch version.

## Data And Privacy

Pomodoom stores session history, settings, to-do items, onboarding state, and tutorial flags locally on the device using AsyncStorage. The app does not sell or share user data, and there are no ads SDKs in this release.

You can delete local app data from Settings > Data Controls > Clear All Data.

For more details, see [PRIVACY_POLICY.md](PRIVACY_POLICY.md).

## Configuration Notes

- Firebase is initialized in `src/services/firebase/config.ts`.
- Public Expo environment variables can override the bundled Firebase values for release builds.
- Native analytics initialization is disabled in the current release.

## Project Structure

- `src/features/timer` - home timer, timer display, and completion flow.
- `src/features/penalties` - interruption and lock-mode penalty behavior.
- `src/features/statistics` - progress charts and summary metrics.
- `src/features/settings` - duration, penalty, sound, and vibration settings.
- `src/features/onboarding` - first-run guidance.
- `src/context` - shared session and settings state.
- `src/shared` - reusable UI components and hooks.

## Deployment

The project includes a web export workflow and Firebase Hosting support. Build the web app with `npm run build:web`, then deploy with `npm run deploy:hosting`.

## License

No license file is currently included in this repository.