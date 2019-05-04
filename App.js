import React from 'react';
import { AsyncStorage, StyleSheet, Switch, TextInput } from 'react-native';
import * as chart from './rpechart.json';
import { AppLoading, Font, LinearGradient } from 'expo';
import { Button, Divider, DropDownMenu, Heading, Text, View } from '@shoutem/ui';
import { Surface } from 'react-native-paper';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.repValues = [];
    this.rpeValues = [];

    for (let rep = 1; rep <= 12; rep++) {
      this.repValues.push({
        "index": this.repValues.length,
        "value": String(rep)
      });
    }

    for (let rpe = 6.5; rpe <= 10; rpe += 0.5) {
      this.rpeValues.push({
        "index": this.rpeValues.length,
        "value": String(rpe)
      });
    }

    this.state = {
      inputReps: this.repValues[0],
      inputRpe: this.rpeValues[7],
      inputWeight: '225',
      outputReps: this.repValues[4],
      outputRpe: this.rpeValues[3],
      outputWeight: '0',
      fontsAreLoaded: false,
      usingKg: false,
      weightIncrement: 5
    };

    this.state.outputWeight = this.calculateWeight();
  }

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('usingKg');
      if (value !== null) {
        this.setState({ usingKg: value });
      }
    } catch (error) {
      // Error retrieving data
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

    this.setState({ fontsAreLoaded: true });
  }

  handleChange = property => text => {
    if (this.state.usingKg) {
      text = parseFloat(text);
    } else {
      // Make input only integers
      text = text.replace(/[^0-9]/g, '');
      text = parseFloat(text);
    }

    // If not an int, make it 0
    if (isNaN(text)) {
      text = 0;
    }

    // Make it positive
    if (text < 0) {
      text = text * -1;
    }

    this.setState({ [property]: String(text) }, () => {
      this.setState({ outputWeight: this.calculateWeight() })
    });
  }

  handleDropDownSelection = (property, item) => {
    this.setState({ [property]: item }, () => {
      this.setState({ outputWeight: this.calculateWeight() })
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
      this.setState({ outputWeight: this.calculateWeight() })
    });
  }

  increaseInputWeight = () => {
    var newInputWeight = this.roundToNearestWeight(parseFloat(this.state.inputWeight) + this.state.weightIncrement);
    this.setState({ inputWeight: String(newInputWeight) }, () => {
      this.setState({ outputWeight: this.calculateWeight() })
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
    var incrementValue = 5;
    var defaultWeight = '225';
    if (value === true) {
      incrementValue = 1.25;
      defaultWeight = '100';
    }
    this.setState({ usingKg: value, weightIncrement: incrementValue, inputWeight: defaultWeight }, () => {
      this.setState({ outputWeight: this.calculateWeight() })
    });

    _storeData = async () => {
      try {
        await AsyncStorage.setItem('usingKg', value);
      } catch (error) {
        // Error saving data
      }
    };
    
  }

  render() {
    const { fontsAreLoaded, usingKg } = this.state;

    if (!fontsAreLoaded) {
      return <AppLoading />;
    }

    return (
      <View style={{ flex: 1 }}>

        <LinearGradient
          colors={['#EB3349', '#F45C43']}
          style={{ flex: 1, alignItems: 'center' }}>

          <View style={{ flex: 1, alignItems: 'center', paddingTop: 60 }}>

            <View styleName="md-gutter horizontal">
              <Text styleName="v-center" style={{ color: '#FFFFFF' }}>lbs</Text>
              <Switch
                onValueChange={this.toggleUnit}
                value={usingKg}
                thumbColor="#FFFFFF"
              />
              <Text styleName="v-center" style={{ color: '#FFFFFF' }}>kg</Text>
            </View>

            <Divider styleName="line" style={{ marginTop: 20, marginBottom: 40 }} />

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

            <Divider styleName="line" style={{ marginTop: 40, marginBottom: 40 }} />

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
              elevation: 4
            }}>
              <Heading>Target weight</Heading>
              <Text style={{ padding: 10, fontSize: 40, fontWeight: 'bold', color: '#EB3349' }}>
                {this.state.outputWeight}
              </Text>
            </Surface>
          </View>
        </LinearGradient>
      </View>
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
