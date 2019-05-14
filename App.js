import { createSwitchNavigator, createStackNavigator, createAppContainer } from 'react-navigation';
import Calculator from './Calculator';
import CustomRPEChart from './CustomRPEChart';
import Loading from './Loading';
import { Platform } from 'react-native';
import { SafeAreaView } from "react-navigation";

if (Platform.OS === "android") {
  SafeAreaView.setStatusBarHeight(0);
}

const AppStack = createStackNavigator({
  Calculator: Calculator,
  RPEChart: CustomRPEChart
},
{
  defaultNavigationOptions: {
    headerTintColor: '#FFFFFF',
    headerStyle: {
      backgroundColor: '#C81429',
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