import React from 'react';
import { AsyncStorage, Platform, ScrollView, StyleSheet, Switch, TextInput } from 'react-native';
import * as chart from './rpechart.json';
import { AppLoading, Font, LinearGradient } from 'expo';
import { Button, Divider, DropDownMenu, Heading, Text, View } from '@shoutem/ui';

const START_RPE = 6.5;
const END_RPE = 10;
const RPE_INCREMENT = 0.5;

const START_REP = 1;
const END_REP = 12;

class CustomRPEChart extends React.Component {
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
            selectedRep: this.repValues[0],
            customChart: JSON.parse(JSON.stringify(chart)),
            loaded: false
        }

        delete this.state.customChart.default;
    }

    async storeChart() {
        try {
            await AsyncStorage.setItem('rpe_chart', JSON.stringify(this.state.customChart));
        } catch (error) {
            console.log(error);
        }
    };

    async retrieveChart() {
        try {
            const storedChart = await AsyncStorage.getItem('rpe_chart');

            if (storedChart !== null) {
                this.setState({ customChart: JSON.parse(storedChart) });
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

        this.retrieveChart();

        this.setState({ loaded: true });
    }

    handleDropDownSelection = (item) => {
        this.setState({ selectedRep: item });
    };

    handlePercentageInput = rpe => text => {
        const editedChart = JSON.parse(JSON.stringify(this.state.customChart));
        editedChart[rpe][this.state.selectedRep.value] = text;
        this.setState({ customChart: editedChart });
    }

    reset = () => {
        const resetChart = JSON.parse(JSON.stringify(chart));
        this.setState({ customChart: resetChart }, () => this.storeChart());
    }

    save = () => {
        const editedChart = JSON.parse(JSON.stringify(this.state.customChart));

        Object.keys(this.state.customChart).forEach(rpe => {
            Object.keys(this.state.customChart[rpe]).forEach(rep => {
                var val = parseFloat(this.state.customChart[rpe][rep]).toFixed(1);
                editedChart[rpe][rep] = parseFloat(val);
            });
        });

        this.setState({ customChart: editedChart }, () => this.storeChart());
    }

    getRpePercentage = rpe => {
        return String(this.state.customChart[rpe][this.state.selectedRep.value]);
    }

    render() {
        const { loaded } = this.state;

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

                        <View styleName="horizontal md-gutter">
                            <Button
                                onPress={this.reset}>
                                <Text>Reset</Text>
                            </Button>

                            <Button
                                onPress={this.save}>
                                <Text>Save</Text>
                            </Button>
                        </View>

                        <Text style={styles.label}>Reps</Text>
                        <DropDownMenu
                            options={this.repValues}
                            selectedOption={this.state.selectedRep}
                            onOptionSelected={(item) => this.handleDropDownSelection(item)}
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

                        <View style={{
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'space-evenly',
                        }}>
                            {
                                this.rpeValues.map(rpe => {
                                    return (
                                        <View style={styles.row} key={"chart_row_" + rpe["index"]}>
                                            <Text style={styles.rowLabel}>
                                                {rpe["value"]}
                                            </Text>
                                            <TextInput
                                                value={this.getRpePercentage(rpe["value"])}
                                                keyboardType='numeric'
                                                returnKeyType='done'
                                                maxLength={4}
                                                style={styles.input}
                                                onChangeText={this.handlePercentageInput(rpe["value"])}
                                            />
                                        </View>
                                    );
                                })
                            }

                        </View>
                    </View>
                </LinearGradient>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    row: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'stretch',
        margin: 5
    },
    label: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center'
    },
    rowLabel: {
        color: '#FFFFFF',
        marginRight: 20
    },
    input: {
        backgroundColor: '#FFFFFF',
        width: 100,
        textAlign: 'center'
    }
});


export default CustomRPEChart;