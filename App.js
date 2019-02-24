import React from 'react';
import { AppRegistry, StyleSheet, Text, TextInput, View } from 'react-native';
import * as chart from './rpechart.json';
//import RepSelector from './RepSelector.js';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputReps: '5',
      inputWeight: '135',
      inputRpe: '7',
      outputReps: '1',
      outputWeight: '0',
      outputRpe: '8'
    };
  }

  handleChange = property => text => {
    console.log('property: ' + property);
    console.log('value: ' + text);
    this.setState({ [property]: text });
    calculateWeight();
  }

  calculateWeight = () => {
    var calculatedOutputWeight = this.state.inputWeight * chart[this.state.outputRpe][this.state.outReps] / chart[this.state.inputRpe][this.state.inputReps]
    console.log('got: ' + calculatedOutputWeight);
    this.setState({ outputWeight: calculatedOutputWeight });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ padding: 10 }}>
        <Text style={{ padding: 10, fontSize: 42 }}>What was your last set?</Text>
          <TextInput
            style={{ height: 40 }}
            placeholder="Reps"
            label="Reps"
            value={this.state.inputReps}
            keyboardType = 'numeric'
            onChangeText={(text) => this.handleChange('inputRepsNum')}
          />
          <TextInput
            style={{ height: 40 }}
            placeholder="Weight"
            label="Weight"
            value={this.state.inputWeight}
            keyboardType = 'numeric'
            onChangeText={(text) => this.handleChange('inputWeight')}
          />
          <TextInput
            style={{ height: 40 }}
            placeholder="RPE"
            label="RPE"
            value={this.state.inputRpe}
            keyboardType = 'numeric'
            onChangeText={(text) => this.handleChange('inputRpe')}
          />

          <Text style={{ padding: 10, fontSize: 42 }}>Target weight for new number of reps and RPE</Text>
          <TextInput
            style={{ height: 40 }}
            placeholder="Reps"
            label="Reps"
            value={this.state.outputReps}
            keyboardType = 'numeric'
            onChangeText={(text) => this.handleChange('outputReps')}
          />
          <TextInput
            style={{ height: 40 }}
            placeholder="RPE"
            label="RPE"
            value={this.state.outputRpe}
            keyboardType = 'numeric'
            onChangeText={(text) => this.handleChange('outputRpe')}
          />
          <Text style={{ padding: 10, fontSize: 42 }}>
            Weight: 0
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
