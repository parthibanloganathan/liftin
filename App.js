import React from 'react';
import { Picker, StyleSheet, TextInput, View } from 'react-native';
import * as chart from './rpechart.json';
// import Button from 'react-native-button';
import { AppLoading, Font, LinearGradient } from 'expo';
import { Button, Divider, Heading, NavigationBar, Switch, Text, Title } from '@shoutem/ui';
// import Selector from './Selector.js';
// import App from './App';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputReps: '1',
      inputRpe: '8',
      inputWeight: '225',
      outputReps: '5',
      outputRpe: '7',
      outputWeight: '0',
      fontsAreLoaded: false,
      usingKg: false,
      weightIncrement: 5
    };

    this.repValues = [];
    this.rpeValues = [];

    for (let rep = 1; rep <= 12; rep++) {
      this.repValues.push(String(rep));
    }

    for (let rpe = 6.5; rpe <= 10; rpe += 0.5) {
      this.rpeValues.push(String(rpe));
    }

    this.state.outputWeight = this.calculateWeight();
  }

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
    // Make input only integers
    text = text.replace(/[^0-9]/g, '');
    text = parseInt(text);

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

  handleSelection = (property, itemValue, itemIndex) => {
    this.setState({ [property]: itemValue }, () => {
      this.setState({ outputWeight: this.calculateWeight() })
    });
  }

  decreaseInputWeight = () => {
    var newInputWeight = parseInt(this.state.inputWeight) - this.state.weightIncrement;
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
    var newInputWeight = this.roundToNearestWeight(parseInt(this.state.inputWeight) + 5);
    this.setState({ inputWeight: String(newInputWeight) }, () => {
      this.setState({ outputWeight: this.calculateWeight() })
    });
  }

  roundToNearestWeight = weight => {
    return Math.floor(weight / this.state.weightIncrement) * this.state.weightIncrement;
  }

  calculateWeight = () => {
    return this.roundToNearestWeight(
      parseInt(this.state.inputWeight) * chart[this.state.outputRpe][this.state.outputReps] / chart[this.state.inputRpe][this.state.inputReps]
    );
  }

  toggleUnit = value => {
    var incrementValue = 5;
    if (value === true) {
      incrementValue = 1.25;
    }
    this.setState({ usingKg: value, weightIncrement: incrementValue });
  }

  render() {
    const { fontsAreLoaded, usingKg } = this.state;

    if (!fontsAreLoaded) {
      return <AppLoading />;
    }

    return (
      <View style={styles.container}>
        <NavigationBar
          centerComponent={<Title>Liftr</Title>}
        />
        <LinearGradient
          colors={['#EB3349', '#F45C43']}
          style={{ flex: 1, padding: 15, alignItems: 'center', borderRadius: 5 }}>

          <View>
            <Text>lbs</Text>
            <Switch
              onValueChange={(value) => this.toggleUnit}
              value={usingKg}
            />
            <Text>kg</Text>
          </View>

          <Heading>What was your last set?</Heading>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}>
            {/* <Selector
        options={this.repValues}
        selected={this.state.inputReps}
        onValueChange={(itemValue, itemIndex) => this.handleSelection('inputReps', itemValue, itemIndex)} /> */}

            <View style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <Text style={styles.label}>Reps</Text>
              <Picker
                selectedValue={this.state.inputReps}
                style={styles.picker}
                onValueChange={(itemValue, itemIndex) => this.handleSelection('inputReps', itemValue, itemIndex)} >
                {this.repValues.map((object, i) =>
                  <Picker.Item label={String(object)} value={String(object)} key={String(object)} />
                )}
              </Picker>
            </View>

            <View style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Text style={styles.label}>RPE</Text>
              <Picker
                selectedValue={this.state.inputRpe}
                style={styles.picker}
                onValueChange={(itemValue, itemIndex) => this.handleSelection('inputRpe', itemValue, itemIndex)} >
                {this.rpeValues.map((object, i) =>
                  <Picker.Item label={String(object)} value={String(object)} key={String(object)} />
                )}
              </Picker>
            </View>
          </View>

          <Text style={styles.label}>Weight</Text>

          <View style={{
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center'
            }}>
              <Button
                onPress={this.decreaseInputWeight}
                styleName="action"
                style={styles.weightButton}>
                <Text>-</Text>
              </Button>
              <TextInput
                style={styles.weightInput}
                value={this.state.inputWeight}
                keyboardType='numeric'
                returnKeyType='done'
                maxLength={3}
                onChangeText={this.handleChange('inputWeight')}
              />

              <Button
                onPress={this.increaseInputWeight}
                styleName="action"
                style={styles.weightButton}>
                <Text>+</Text>
              </Button>
            </View>
          </View>

          <Divider styleName="line" />

          <Heading>Next set reps and RPE</Heading>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly'
          }}>

            <View style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Text style={styles.label}>Reps</Text>
              <Picker
                selectedValue={this.state.outputReps}
                style={styles.picker}
                onValueChange={(itemValue, itemIndex) => this.handleSelection('outputReps', itemValue, itemIndex)} >
                {this.repValues.map((object, i) =>
                  <Picker.Item label={String(object)} value={String(object)} key={String(object)} />
                )}
              </Picker>
            </View>

            <View style={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <Text style={styles.label}>RPE</Text>
              <Picker
                selectedValue={this.state.outputRpe}
                style={styles.picker}
                onValueChange={(itemValue, itemIndex) => this.handleSelection('outputRpe', itemValue, itemIndex)} >
                {this.rpeValues.map((object, i) =>
                  <Picker.Item label={String(object)} value={String(object)} key={String(object)} />
                )}
              </Picker>
            </View>
          </View>

          <Heading>Target weight</Heading>
          <Text style={{ padding: 10, fontSize: 40, fontWeight: 'bold', color: '#FFF' }}>
            {this.state.outputWeight}
          </Text>
        </LinearGradient>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
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
    width: 70
  },
  weightButton: {
    width: 60
  }
});