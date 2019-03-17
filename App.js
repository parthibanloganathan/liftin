import React from 'react';
import { Keyboard, Picker, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import * as chart from './rpechart.json';
import Button from 'react-native-button';
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
      outputWeight: '0'
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
    var newInputWeight = parseInt(this.state.inputWeight) - 5;
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
    return Math.floor(weight / 5) * 5;
  }

  calculateWeight = () => {
    return this.roundToNearestWeight(
      parseInt(this.state.inputWeight) * chart[this.state.outputRpe][this.state.outputReps] / chart[this.state.inputRpe][this.state.inputReps]
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 10, fontSize: 24 }}>What was your last set?</Text>
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
              style={styles.weightButton}>
              -
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
              style={styles.weightButton}>
              +
            </Button>
          </View>
        </View>

        <Text style={{ padding: 10, fontSize: 24 }}>Next set reps and RPE</Text>

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

        <Text style={{ padding: 10, fontSize: 24 }}>
          Target weight
          </Text>
        <Text style={{ padding: 10, fontSize: 40, fontWeight: 'bold', color: '#F18F01' }}>
          {this.state.outputWeight}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    fontSize: 18,
    color: '#006E90',
    textAlign: 'center'
  },
  picker: {
    color: '#F18F01',
  },
  items: {
    color: 'red'
  },
  weightInput: {
    padding: 10,
    fontSize: 28,
    color: '#F18F01',
    width: 70
  },
  weightButton: {
    height: 50,
    width: 50,
    color: '#ffffff',
    backgroundColor: '#006E90',
    paddingTop: 13
  }
});
