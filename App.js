import React from 'react';
import { Picker, StyleSheet, Text, TextInput, View } from 'react-native';
import * as chart from './rpechart.json';
//import Selector from './Selector.js';

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
    this.setState({ [property]: text }, () => {
      this.setState({ outputWeight: this.calculateWeight() })
    });  }

  handleSelection = (property, itemValue, itemIndex) => {
    this.setState({ [property]: itemValue }, () => {
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
        <View style={{ padding: 10 }}>
        {/* <Selector /> */}
          <Text style={{ padding: 10, fontSize: 24 }}>What was your last set?</Text>
          <Picker
            selectedValue={this.state.inputReps}
            style={{ height: 50, width: 100 }}
            onValueChange={(itemValue, itemIndex) => this.handleSelection('inputReps', itemValue, itemIndex)} >
            {this.repValues.map((object, i) =>
              <Picker.Item label={String(object)} value={String(object)} key={String(object)} />
            )}
          </Picker>

          <Picker
            selectedValue={this.state.inputRpe}
            style={{ height: 50, width: 100 }}
            onValueChange={(itemValue, itemIndex) => this.handleSelection('inputRpe', itemValue, itemIndex)} >
            {this.rpeValues.map((object, i) =>
              <Picker.Item label={String(object)} value={String(object)} key={String(object)} />
            )}
          </Picker>

          <TextInput
            style={{ height: 40 }}
            placeholder="Weight"
            label="Weight"
            value={this.state.inputWeight}
            keyboardType='numeric'
            onChangeText={this.handleChange('inputWeight')}
          />

          <Text style={{ padding: 10, fontSize: 24 }}>Target weight for new number of reps and RPE</Text>
          <Picker
            selectedValue={this.state.outputReps}
            style={{ height: 50, width: 100 }}
            onValueChange={(itemValue, itemIndex) => this.handleSelection('outputReps', itemValue, itemIndex)} >
            {this.repValues.map((object, i) =>
              <Picker.Item label={String(object)} value={String(object)} key={String(object)} />
            )}
          </Picker>

          <Picker
            selectedValue={this.state.outputRpe}
            style={{ height: 50, width: 100 }}
            onValueChange={(itemValue, itemIndex) => this.handleSelection('outputRpe', itemValue, itemIndex)} >
            {this.rpeValues.map((object, i) =>
              <Picker.Item label={String(object)} value={String(object)} key={String(object)} />
            )}
          </Picker>

          <Text style={{ padding: 10, fontSize: 18 }}>
            Weight: {this.state.outputWeight}
          </Text>
        </View>
      </View >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
