import type { Translation } from './uk';

const en: Translation = {
  common: {
    next: 'Next',
    skip: 'Skip',
    start: 'Get started',
    later: 'Later',
  },
  onboarding: {
    slide1Title: 'A voice that lives in a place',
    slide1Body: 'Record a voice note and “bury” it at a spot on the map. Only someone who comes here can hear it.',
    slide2Title: 'The place is the key',
    slide2Body: 'Capsules on the map are just blurred waves. Get closer, and within 50 metres it opens.',
    slide3Title: 'For everyone, for one, for later',
    slide3Body: 'Public city stories, surprises for loved ones, and time capsules that open a year from now.',
    permissionsTitle: 'Two permissions',
    permissionsBody: 'Location to find capsules nearby. Microphone to record your own. We never store your movement history.',
    allow: 'Allow',
    location: 'Location',
    microphone: 'Microphone',
    granted: 'allowed',
    denied: 'not allowed',
  },
  auth: {
    title: 'Vidlunnia',
    subtitle: 'Voice capsules on the map',
    google: 'Continue with Google',
    apple: 'Continue with Apple',
    terms: 'By continuing you agree to the Terms of Use and Privacy Policy.',
    error: 'Could not sign in. Please try again.',
  },
  tabs: {
    map: 'Map',
    profile: 'Profile',
  },
  map: {
    title: 'Capsules nearby',
    placeholder: 'The map with capsules around you will be here',
    filterPublic: 'Public',
    filterMine: 'Mine',
    filterForMe: 'For me',
    filterQuests: 'Quests',
    record: 'Record a capsule',
  },
  profile: {
    title: 'Profile',
    myCapsules: 'My capsules',
    found: 'Found',
    settings: 'Settings',
    theme: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    themeSystem: 'System',
    language: 'Language',
    signOut: 'Sign out',
    resetOnboarding: 'Show onboarding again',
  },
};

export default en;
