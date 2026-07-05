import React from 'react';
import { Provider } from 'react-redux';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { DefaultTheme } from '@react-navigation/native';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';

// Force light theme regardless of device dark mode setting
const navigationLightTheme = {
  ...DefaultTheme,
  dark: false,
};

function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <PaperProvider theme={MD3LightTheme}>
        <AppNavigator theme={navigationLightTheme} />
      </PaperProvider>
    </Provider>
  );
}

export default App;
