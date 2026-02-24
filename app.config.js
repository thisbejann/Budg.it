const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_BETA = process.env.APP_VARIANT === 'beta';

const getAppName = () => {
  if (IS_DEV) return 'BudgetTracker (Dev)';
  if (IS_BETA) return 'BudgetTracker';
  return 'BudgetTracker';
};

const getPackageName = () => {
  if (IS_DEV) return 'com.budgettracker.dev';
  if (IS_BETA) return 'com.budgettracker.beta';
  return 'com.budgettracker';
};

module.exports = {
  expo: {
    name: getAppName(),
    slug: 'budget-tracker',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: getPackageName(),
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#ffffff',
      },
      package: getPackageName(),
      softwareKeyboardLayoutMode: 'pan',
    },
    plugins: ['expo-sqlite', '@react-native-community/datetimepicker'],
    extra: {
      eas: {
        projectId: 'aef9cadd-8e48-4e3e-9a50-d11c415ffdb4',
      },
    },
  },
};
