import { createSwitchNavigator, createStackNavigator, createAppContainer } from 'react-navigation';
import Calculator from './Calculator';
import CustomRPEChart from './CustomRPEChart';
import Loading from './Loading';

const AppNavigator = createStackNavigator(
  {
    Calculator: Calculator,
    RPEChart: CustomRPEChart
  },
  {
    initialRouteName: "Calculator",
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#C81429',
      }
    }
  }
);

const AppStack = createStackNavigator({
  Calculator: Calculator,
  RPEChart: CustomRPEChart
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