import React from 'react';
import { AsyncStorage, ScrollView, StyleSheet, TextInput } from 'react-native';
import * as chart from './rpechart.json';
import { AppLoading, LinearGradient } from 'expo';
import { Button, Divider, DropDownMenu, Heading, Icon, Text, View } from '@shoutem/ui';
import Toast from 'react-native-easy-toast'

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

    async storeItem(key, value) {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
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
        this.storeItem('is_custom_chart', false);
        this.refs.toast.show('Reset and using default RPE chart', 1000);
    }

    save = () => {
        const editedChart = JSON.parse(JSON.stringify(this.state.customChart));

        Object.keys(this.state.customChart).forEach(rpe => {
            Object.keys(this.state.customChart[rpe]).forEach(rep => {
                var val = parseFloat(this.state.customChart[rpe][rep]).toFixed(1);
                if (val <= 0) {
                    val = 1;
                }
                if (val > 100) {
                    val = 100;
                }
                editedChart[rpe][rep] = parseFloat(val);
            });
        });

        this.setState({ customChart: editedChart }, () => this.storeChart());
        this.storeItem('is_custom_chart', true);
        this.refs.toast.show('Saved and using custom RPE chart', 1000);
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

                <Toast
                    ref="toast"
                    positionValue={200} />

                <LinearGradient
                    colors={['#EB3349', '#F45C43']}
                    style={{ flex: 1, alignItems: 'center' }}>

                    {/* See https://medium.com/@peterpme/taming-react-natives-scrollview-with-flex-144e6ff76c08 */}
                    <View style={{ flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>

                        <View styleName="horizontal">
                            <Button
                                styleName="md-gutter"
                                onPress={this.save}>
                                <Text>SAVE</Text>
                            </Button>

                            <Button
                                styleName="md-gutter"
                                onPress={this.reset}>
                                <Text>RESET</Text>
                            </Button>
                        </View>

                        <View style={{
                            flex: 1,
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}>

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

                            <View style={styles.row}>
                                <Heading style={styles.rowLabel}>
                                    RPE
                                </Heading>
                                <Heading style={styles.rowLabel}>
                                    %
                                </Heading>
                            </View>

                            <Divider styleName="line" style={{ marginTop: 10, marginBottom: 10 }} />

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
                            <View style={{ height: 100 }}></View>
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
        alignItems: 'stretch',
        margin: 5
    },
    label: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    rowLabel: {
        color: '#FFFFFF',
        textAlign: 'center',
        paddingTop: 20,
        width: 100
    },
    input: {
        backgroundColor: '#FFFFFF',
        width: 100,
        textAlign: 'center'
    }
});


export default CustomRPEChart;