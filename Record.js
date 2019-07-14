import React from 'react';
import { AsyncStorage, Dimensions, ScrollView, StyleSheet } from 'react-native';
import { AppLoading } from 'expo';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, DropDownMenu, Heading, Image, Text, View } from '@shoutem/ui';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-easy-toast'

class Record extends React.Component {
    constructor(props) {
        super(props);
        this.exercises = [
            {
                "index": 0,
                "value": "Squat"
            },
            {
                "index": 1,
                "value": "Deadlift"
            },
            {
                "index": 2,
                "value": "Bench Press"
            }
        ]

        this.state = {
            lifts: [],
            selectedExercise: this.exercises[0],
            videoUri: null,
            rpe: this.props.navigation.getParam('rpe', '8'),
            reps: this.props.navigation.getParam('reps', '1'),
            weight: this.props.navigation.getParam('weight', 225),
            unit: this.props.navigation.getParam('unit', "lbs"),
            loaded: false
        };
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
            const recordedLifts = await AsyncStorage.getItem('recordedLifts');
            const selectedExerciseIndex = await AsyncStorage.getItem('selectedExerciseIndex');

            if (recordedLifts !== null) {
                this.setState({ lifts: JSON.parse(recordedLifts) });
            }
            if (selectedExerciseIndex !== null) {
                this.setState({ selectedExercise: this.exercises[parseInt(selectedExerciseIndex)] });
            }

        } catch (error) {
            console.log(error);
        }
    };

    async componentWillMount() {
        this.retrieveState();
        this.setState({ loaded: true });
    }

    handleDropDownSelection = (property, item) => {
        this.setState({ [property]: item }, () => {
            this.storeItem([property] + "Index", item.index);
        });
    }

    selectVideo = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.CAMERA_ROLL);
        if (status === 'granted') {
            let result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                mediaTypes: ImagePicker.MediaTypeOptions.Videos
            });

            if (!result.cancelled) {
                this.setState({ videoUri: result.uri });
                this.refs.toast.show('Video selected', 1000);
            }
        } else {
            this.refs.toast.show('You need to provide camera permissions to record', 1000);
        }
    }

    recordVideo = async () => {
        this.props.navigation.navigate('VideoCamera', {
            onVideoTaken: videoUri => {
                this.setState({ videoUri: videoUri });
                this.refs.toast.show('Video selected', 1000);
            }
        })
    }

    save = () => {
        if (this.state.videoUri === null) {
            this.refs.toast.show('Select a recording first', 1000);
            return;
        }

        var updatedLifts = JSON.parse(JSON.stringify(this.state.lifts));

        updatedLifts.push({
            id: this.state.lifts.length,
            weight: this.state.weight,
            reps: this.state.reps,
            rpe: this.state.rpe,
            date: new Date(),
            unit: this.state.unit,
            video: this.state.videoUri,
            thumbnailUri: this.state.thumbnailUri,
            exercise: this.state.selectedExercise.value
        });

        this.setState({ lifts: updatedLifts }, () => {
            this.storeItem("recordedLifts", this.state.lifts).then(() => {
                this.props.navigation.goBack();
            });
        });
    }

    render() {
        const { screenWidth } = Dimensions.get('window');
        const { loaded } = this.state;

        if (!loaded) {
            return <AppLoading />;
        }

        return (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

                <LinearGradient
                    colors={['#EB3349', '#F45C43']}
                    style={{ flex: 1, alignItems: 'center' }}>

                    <Toast
                        ref="toast"
                        positionValue={20} />

                    <View style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        marginTop: 10
                    }}>
                        <Heading style={{ textAlign: 'center' }}>Record this lift</Heading>
                        <Text style={styles.label}>{this.state.weight} {this.state.unit} for {this.state.reps} rep(s) at RPE {this.state.rpe}</Text>
                        <DropDownMenu
                            options={this.exercises}
                            selectedOption={this.state.selectedExercise}
                            onOptionSelected={(item) => this.handleDropDownSelection('selectedExercise', item)}
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

                        {
                            this.state.videoUri ?
                                <Text style={styles.label}>Video selected</Text>
                                :
                                <Text style={styles.label}>No video selected</Text>
                        }

                        <View styleName="horizontal lg-gutter">
                            <Button
                                style={{ marginRight: 10 }}
                                onPress={this.selectVideo}>
                                <Text>SELECT VIDEO</Text>
                            </Button>
                            <Button
                                onPress={this.recordVideo}>
                                <Text>RECORD VIDEO</Text>
                            </Button>
                        </View>
                        <Button
                            style={{ marginBottom: 200 }}
                            muted={this.state.videoUri === null}
                            onPress={this.save}>
                            <Text>SAVE SET</Text>
                        </Button>
                    </View>

                </LinearGradient>
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    label: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center'
    }
});

export default Record;