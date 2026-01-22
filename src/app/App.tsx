import React from 'react';
import { AppProviders } from './providers';
import { RootNavigator } from './navigation';

function App(): React.JSX.Element {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

export default App;
