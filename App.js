import React from 'react';
import { AsyncStorage, Platform, ScrollView, StatusBar, StyleSheet, Switch, TextInput } from 'react-native';
import * as chart from './rpechart.json';
import { AppLoading, Font, LinearGradient } from 'expo';
import { Button, Divider, DropDownMenu, Heading, Text, View } from '@shoutem/ui';
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

export default class App extends React.Component {
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
      inputReps: this.repValues[0],
      inputRpe: this.rpeValues[7],
      inputWeight: String(DEFAULT_INPUT_WEIGHT_LBS),
      outputReps: this.repValues[4],
      outputRpe: this.rpeValues[3],
      outputWeight: '0',
      loaded: false,
      usingKg: false,
      weightIncrement: LBS_INCREMENT
    };

    this.state.outputWeight = this.calculateWeight();
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

      if (value === "true") {
        this.setUnit(true);
      } else {
        this.setUnit(false);
      }

      if (inputRepsIndex !== null) {
        this.setState({ inputReps: this.repValues[parseInt(inputRepsIndex)]});
      }
      if (inputRpeIndex !== null) {
        this.setState({ inputRpe: this.rpeValues[parseInt(inputRpeIndex)]});
      }
      if (inputWeight !== null) {
        this.setState({ inputWeight: inputWeight });
      }
      if (outputRepsIndex !== null) {
        this.setState({ outputReps: this.repValues[parseInt(outputRepsIndex)]});
      }
      if (outputRpeIndex !== null) {
        this.setState({ outputRpe: this.rpeValues[parseInt(outputRpeIndex)]});
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

  handleChange = property => text => {
    if (this.state.usingKg) {
      text = parseFloat(text);
    } else {
      // Make input only integers
      text = text.replace(/[^0-9]/g, '');
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
      this.setState({ outputWeight: this.calculateWeight() });
      this.storeItem(property, text);
    });
  }

  handleDropDownSelection = (property, item) => {
    this.setState({ [property]: item }, () => {
      this.setState({ outputWeight: this.calculateWeight() });
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
      this.setState({ outputWeight: this.calculateWeight() });
      this.storeItem("inputWeight", newInputWeight);
    });
  }

  increaseInputWeight = () => {
    var newInputWeight = this.roundToNearestWeight(parseFloat(this.state.inputWeight) + this.state.weightIncrement);
    this.setState({ inputWeight: String(newInputWeight) }, () => {
      this.setState({ outputWeight: this.calculateWeight() });
      this.storeItem("inputWeight", newInputWeight);
    });
  }

  roundToNearestWeight = weight => {
    return Math.floor(weight / this.state.weightIncrement) * this.state.weightIncrement;
  }

  calculateWeight = () => {
    return this.roundToNearestWeight(
      parseInt(this.state.inputWeight) * chart[this.state.outputRpe.value][this.state.outputReps.value] / chart[this.state.inputRpe.value][this.state.inputReps.value]
    );
  }

  toggleUnit = value => {
    this.setUnit(value).then(() => {
      this.setState({ outputWeight: this.calculateWeight() });
      this.setUnit(value);
    });
  }

  render() {
    const { fontsAreLoaded, usingKg } = this.state;

    if (!fontsAreLoaded) {
      return <AppLoading />;
    }

    return (
      <ScrollView style={{ paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight }}
        contentContainerStyle={{ flexGrow: 1 }}>

        <LinearGradient
          colors={['#EB3349', '#F45C43']}
          style={{ flex: 1, alignItems: 'center' }}>

          {/* See https://medium.com/@peterpme/taming-react-natives-scrollview-with-flex-144e6ff76c08 */}
          <View style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>

            <View styleName="md-gutter horizontal">
              <Text styleName="v-center" style={{ color: '#FFFFFF' }}>lbs</Text>
              <Switch
                onValueChange={this.toggleUnit}
                value={usingKg}
                thumbColor="#FFFFFF"
                style={{
                  marginLeft: 20,
                  marginRight: 20,
                  marginTop: 10
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
  bottom: {
    flex: 1,
    height: 30,
    justifyContent: 'flex-end',
    backgroundColor: 'blue'
  },
  label: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center'
  },
  picker: {
    color: '#FFFFFF'
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
