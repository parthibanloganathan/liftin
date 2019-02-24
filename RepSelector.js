import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Picker from 'react-mobile-picker-scroll';

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            valueGroups: {
                reps: 5
            },
            optionGroups: {
                reps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            }
        };
    }

    handleChange = (name, value) => {
        this.setState(({valueGroups}) => ({
          valueGroups: {
            ...valueGroups,
            [name]: value
          }
        }));
      };;

    render() {
        const { optionGroups, valueGroups } = this.state;

        return (

            <View style={styles.container}>
                <Picker
                    optionGroups={optionGroups}
                    valueGroups={valueGroups}
                    onChange={this.handleChange} />
            </View>
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