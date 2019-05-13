import React from 'react';
import { AsyncStorage, Platform, ScrollView, StyleSheet, Switch, Text, TextInput } from 'react-native';
import * as defaultChart from './rpechart.json';
import { AppLoading, Font, LinearGradient } from 'expo';
import { Button, Divider, DropDownMenu, Heading, Icon, View } from '@shoutem/ui';
import { Surface } from 'react-native-paper';

const LBS_INCREMENT = 5;
const KG_INCREMENT = 2.5;

const START_RPE = 6.5;
const END_RPE = 10;
const RPE_INCREMENT = 0.5;

const START_REP = 1;
const END_REP = 12;

const DEFAULT_INPUT_WEIGHT_LBS = 225;
const DEFAULT_INPUT_WEIGHT_KG = 100;

class Calculator extends React.Component {
  constructor(props) {
    super(props);
    this.repValues = [];
    this.rpeValues = [];

    for (let rep = START_REP; rep <= END_REP; rep++) {
      this.repValues.push({
        "index": this.repValues.length,
        "value": String(rep)
      });
    }

    for (let rpe = START_RPE; rpe <= END_RPE; rpe += RPE_INCREMENT) {
      this.rpeValues.push({
        "index": this.rpeValues.length,
        "value": String(rpe)
      });
    }

    this.state = {
      inputReps: this.repValues[4],
      inputRpe: this.rpeValues[3],
      inputWeight: String(DEFAULT_INPUT_WEIGHT_LBS),
      outputReps: this.repValues[0],
      outputRpe: this.rpeValues[5],
      outputWeight: '0',
      oneRepMax: '0',
      loaded: false,
      usingKg: false,
      weightIncrement: LBS_INCREMENT,
      chart: defaultChart
    };

    delete this.state.chart.default;

    this.state.outputWeight = this.calculateWeight();
    this.state.oneRepMax = this.calculateOneRepMax();
  }

  setUnit = async (usingKgValue) => {
    var incrementValue = LBS_INCREMENT;
    var defaultWeight = DEFAULT_INPUT_WEIGHT_LBS;

    if (usingKgValue) {
      incrementValue = KG_INCREMENT;
      defaultWeight = DEFAULT_INPUT_WEIGHT_KG;
    }

    this.setState({ usingKg: usingKgValue, weightIncrement: incrementValue, inputWeight: String(defaultWeight) });
    this.storeItem("usingKg", usingKgValue);
    this.storeItem("inputWeight", defaultWeight);
  }

  async storeItem(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  async retrieveState() {
    try {
      const value = await AsyncStorage.getItem('usingKg');
      const inputRepsIndex = await AsyncStorage.getItem('inputRepsIndex');
      const inputRpeIndex = await AsyncStorage.getItem('inputRpeIndex');
      const inputWeight = await AsyncStorage.getItem('inputWeight');
      const outputRepsIndex = await AsyncStorage.getItem('outputRepsIndex');
      const outputRpeIndex = await AsyncStorage.getItem('outputRpeIndex');
      const storedChart = await AsyncStorage.getItem('rpe_chart');

      if (value === "true") {
        this.setUnit(true);
      } else {
        this.setUnit(false);
      }

      if (inputRepsIndex !== null) {
        this.setState({ inputReps: this.repValues[parseInt(inputRepsIndex)] });
      }
      if (inputRpeIndex !== null) {
        this.setState({ inputRpe: this.rpeValues[parseInt(inputRpeIndex)] });
      }
      if (inputWeight !== null) {
        this.setState({ inputWeight: inputWeight });
      }
      if (outputRepsIndex !== null) {
        this.setState({ outputReps: this.repValues[parseInt(outputRepsIndex)] });
      }
      if (outputRpeIndex !== null) {
        this.setState({ outputRpe: this.rpeValues[parseInt(outputRpeIndex)] });
      }
      if (storedChart !== null) {
        console.log("loading chart into calc");
        this.setState({ chart: JSON.parse(storedChart) });
      }

    } catch (error) {
      console.log(error);
    }
  };

  async componentWillMount() {
    await Font.loadAsync({
      'Rubik-Black': require('./node_modules/@shoutem/ui/fonts/Rubik-Black.ttf'),
      'Rubik-BlackItalic': require('./node_modules/@shoutem/ui/fonts/Rubik-BlackItalic.ttf'),
      'Rubik-Bold': require('./node_modules/@shoutem/ui/fonts/Rubik-Bold.ttf'),
      'Rubik-BoldItalic': require('./node_modules/@shoutem/ui/fonts/Rubik-BoldItalic.ttf'),
      'Rubik-Italic': require('./node_modules/@shoutem/ui/fonts/Rubik-Italic.ttf'),
      'Rubik-Light': require('./node_modules/@shoutem/ui/fonts/Rubik-Light.ttf'),
      'Rubik-LightItalic': require('./node_modules/@shoutem/ui/fonts/Rubik-LightItalic.ttf'),
      'Rubik-Medium': require('./node_modules/@shoutem/ui/fonts/Rubik-Medium.ttf'),
      'Rubik-MediumItalic': require('./node_modules/@shoutem/ui/fonts/Rubik-MediumItalic.ttf'),
      'Rubik-Regular': require('./node_modules/@shoutem/ui/fonts/Rubik-Regular.ttf'),
      'rubicon-icon-font': require('./node_modules/@shoutem/ui/fonts/rubicon-icon-font.ttf'),
    });

    this.retrieveState();

    this.setState({ loaded: true });
  }

  static navigationOptions = ({ navigation }) => {
    return {
      Title: "Home",
      headerRight: (
        <Icon name="edit"
          onPress={() => navigation.navigate('RPEChart')} />
      )
    }
  };

  handleChange = property => text => {
    if (this.state.usingKg) {
      text = parseFloat(text);
    } else {
      // Make input only integers
      text = text.replace(/[^0-9.]/g, '');
      text = parseFloat(text);
    }

    // If not a number, make it 0
    if (isNaN(text)) {
      text = 0;
    }

    // Make it positive
    if (text < 0) {
      text = text * -1;
    }

    this.setState({ [property]: String(text) }, () => {
      this.setState({ outputWeight: this.calculateWeight(), oneRepMax: this.calculateOneRepMax() });
      this.storeItem(property, text);
    });
  }

  handleDropDownSelection = (property, item) => {
    this.setState({ [property]: item }, () => {
      this.setState({ outputWeight: this.calculateWeight(), oneRepMax: this.calculateOneRepMax() });
      this.storeItem([property] + "Index", item.index);
    });
  }

  decreaseInputWeight = () => {
    var newInputWeight = parseFloat(this.state.inputWeight) - this.state.weightIncrement;
    if (newInputWeight > 0) {
      newInputWeight = this.roundToNearestWeight(newInputWeight);
    } else {
      newInputWeight = 0;
    }
    this.setState({ inputWeight: String(newInputWeight) }, () => {
      this.setState({ outputWeight: this.calculateWeight(), oneRepMax: this.calculateOneRepMax() });
      this.storeItem("inputWeight", newInputWeight);
    });
  }

  increaseInputWeight = () => {
    var newInputWeight = this.roundToNearestWeight(parseFloat(this.state.inputWeight) + this.state.weightIncrement);
    this.setState({ inputWeight: String(newInputWeight) }, () => {
      this.setState({ outputWeight: this.calculateWeight(), oneRepMax: this.calculateOneRepMax() });
      this.storeItem("inputWeight", newInputWeight);
    });
  }

  roundToNearestWeight = weight => {
    return Math.floor(weight / this.state.weightIncrement) * this.state.weightIncrement;
  }

  calculateWeight = () => {
    return this.roundToNearestWeight(
      parseInt(this.state.inputWeight) * this.state.chart[this.state.outputRpe.value][this.state.outputReps.value] / this.state.chart[this.state.inputRpe.value][this.state.inputReps.value]
    );
  }

  calculateOneRepMax = () => {
    return this.roundToNearestWeight(
      parseInt(this.state.inputWeight) * this.state.chart['10']['1'] / this.state.chart[this.state.inputRpe.value][this.state.inputReps.value]
    );
  }

  toggleUnit = value => {
    this.setUnit(value).then(() => {
      this.setState({ outputWeight: this.calculateWeight(), oneRepMax: this.calculateOneRepMax() });
      this.setUnit(value);
    });
  }

  render() {
    const { loaded, usingKg } = this.state;

    var top_margin = 0;
    if (Platform.OS === 'ios') {
      top_margin = 25;
    }

    if (!loaded) {
      return <AppLoading />;
    }

    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

        <LinearGradient
          colors={['#EB3349', '#F45C43']}
          style={{ flex: 1, alignItems: 'center' }}>

          {/* See https://medium.com/@peterpme/taming-react-natives-scrollview-with-flex-144e6ff76c08 */}
          <View style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>

            <Button
              onPress={() => this.props.navigation.navigate('RPEChart')}>
              <Icon name="edit" />
            </Button>

            <View styleName="md-gutter horizontal">
              <Text styleName="v-center" style={{ color: '#FFFFFF' }}>lbs</Text>
              <Switch
                onValueChange={this.toggleUnit}
                value={usingKg}
                thumbColor="#FFFFFF"
                trackColor={{ false: '#FFFFFF', true: '#48EB33' }}
                style={{
                  marginLeft: 20,
                  marginRight: 20,
                  marginTop: top_margin
                }}
              />
              <Text styleName="v-center" style={{ color: '#FFFFFF' }}>kg</Text>
            </View>

            <Divider styleName="line" style={{ marginBottom: 20 }} />

            <Heading>What was your last set?</Heading>
            <View styleName="horizontal md-gutter">

              <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
              }}>
                <Text style={styles.label}>Reps</Text>
                <DropDownMenu
                  options={this.repValues}
                  selectedOption={this.state.inputReps}
                  onOptionSelected={(item) => this.handleDropDownSelection('inputReps', item)}
                  titleProperty="value"
                  valueProperty="index"
                  style={{
                    selectedOption: {
                      backgroundColor: 'white',
                      borderRadius: 5,
                      margin: 10
                    }
                  }}
                />
              </View>

              <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Text style={styles.label}>RPE</Text>
                <DropDownMenu
                  options={this.rpeValues}
                  selectedOption={this.state.inputRpe}
                  onOptionSelected={(item) => this.handleDropDownSelection('inputRpe', item)}
                  titleProperty="value"
                  valueProperty="index"
                  style={{
                    selectedOption: {
                      backgroundColor: 'white',
                      borderRadius: 5,
                      margin: 10
                    }
                  }}
                />
              </View>
            </View>

            <Text style={styles.label}>Weight</Text>

            <View style={{
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <View style={styles.row}>
                <Button
                  onPress={this.decreaseInputWeight}
                  style={styles.weightButton}>
                  <Text style={{ fontSize: 20 }}>-</Text>
                </Button>
                <TextInput
                  style={styles.weightInput}
                  value={this.state.inputWeight}
                  keyboardType='numeric'
                  returnKeyType='done'
                  maxLength={7}
                  onChangeText={this.handleChange('inputWeight')}
                />
                <Button
                  onPress={this.increaseInputWeight}
                  style={styles.weightButton}>
                  <Text style={{ fontSize: 20 }}>+</Text>
                </Button>
              </View>
            </View>

            <Divider styleName="line" style={{ marginTop: 20, marginBottom: 20 }} />

            <Heading>Next set</Heading>

            <View styleName="horizontal md-gutter">

              <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Text style={styles.label}>Reps</Text>
                <DropDownMenu
                  options={this.repValues}
                  selectedOption={this.state.outputReps}
                  onOptionSelected={(item) => this.handleDropDownSelection('outputReps', item)}
                  titleProperty="value"
                  valueProperty="index"
                  style={{
                    selectedOption: {
                      backgroundColor: 'white',
                      borderRadius: 5,
                      margin: 10
                    }
                  }}
                />
              </View>

              <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Text style={styles.label}>RPE</Text>
                <DropDownMenu
                  options={this.rpeValues}
                  selectedOption={this.state.outputRpe}
                  onOptionSelected={(item) => this.handleDropDownSelection('outputRpe', item)}
                  titleProperty="value"
                  valueProperty="index"
                  style={{
                    selectedOption: {
                      backgroundColor: 'white',
                      borderRadius: 5,
                      margin: 10
                    }
                  }}
                />
              </View>
            </View>

            <Surface style={{
              padding: 20,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 4,
              marginBottom: 40
            }}>
              <Heading>Target weight</Heading>
              <Text style={{ padding: 10, fontSize: 40, fontWeight: 'bold', color: '#EB3349' }}>
                {this.state.outputWeight}
              </Text>
              <Heading>One Rep Max</Heading>
              <Text style={{ padding: 10, fontSize: 32, color: '#EB3349' }}>
                {this.state.oneRepMax}
              </Text>
            </Surface>
          </View>
        </LinearGradient>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center'
  },
  weightInput: {
    padding: 10,
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    width: 110
  },
  weightButton: {
    width: 60,
    borderRadius: 5
  }
});

export default Calculator;