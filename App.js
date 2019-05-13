import { createSwitchNavigator, createStackNavigator, createAppContainer } from 'react-navigation';
import Calculator from './Calculator';
import CustomRPEChart from './CustomRPEChart';
import Loading from './Loading';
import { Constants } from 'expo';
import { Platform } from 'react-native';

const AppStack = createStackNavigator({
  Calculator: Calculator,
  RPEChart: CustomRPEChart
},
{
  defaultNavigationOptions: {
    headerTintColor: '#FFFFFF',
    headerStyle: {
      backgroundColor: '#C81429',
      // marginTop: (Platform.OS === 'ios') ? 0 : Constants.statusBarHeight
    }
  }
});

const SplashStack = createStackNavigator({ Splash: Loading });

const App = createAppContainer(createSwitchNavigator(
  {
    Initial: Loading,
    Splash: SplashStack,
    App: AppStack,
  },
  {
    initialRouteName: 'Initial'
  }
));

export default App;