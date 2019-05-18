import React from 'react';
import { AsyncStorage, StyleSheet } from 'react-native';
import { Button, Divider, Icon, ImageBackground, ListView, Screen, Subtitle, Text, Tile, Title, View } from '@shoutem/ui';
import { AppLoading, LinearGradient } from 'expo';
import Toast from 'react-native-easy-toast'

const dateFormat = require('dateformat');

const images = {
    squat: require('./assets/Squat.jpg'),
    deadlift: require('./assets/Deadlift.jpg'),
    benchpress: require('./assets/BenchPress.jpg'),
};

class Recordings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lifts: [],
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

    async retrieveRecordings() {
        try {
            const storedLifts = await AsyncStorage.getItem('recordedLifts');

            if (storedLifts !== null) {
                this.setState({ lifts: JSON.parse(storedLifts) });
            }

        } catch (error) {
            console.log(error);
        }
    };

    async componentWillMount() {
        this.retrieveRecordings();
        this.setState({ loaded: true });
    }

    deleteLift = id => {
        var updatedLifts = JSON.parse(JSON.stringify(this.state.lifts));
        updatedLifts = updatedLifts.filter(lift => lift.id !== id);
        this.setState({ lifts: updatedLifts }, () => this.storeItem("recordedLifts", this.state.lifts));
        this.refs.toast.show('Deleted lift', 1000);
    }

    renderRow = lift => {
        var image;
        if (lift.exercise === "Squat") {
            image = images.squat;
        } else if (lift.exercise === "Deadlift") {
            image = images.deadlift;
        } else {
            image = images.benchpress;
        }

        return (
            <View>
                <ImageBackground
                    styleName="large-banner"
                    source={image}
                >
                    <Tile>
                        <Title styleName="md-gutter-bottom">{lift.exercise + ": " + lift.weight + " " + lift.unit + " for " + lift.reps + " rep(s) @ RPE " + lift.rpe}</Title>
                        <Subtitle styleName="sm-gutter-horizontal">{dateFormat(lift.date, "mmm d, yyyy")}</Subtitle>
                        <View styleName="horizontal">
                            <Button
                                icon="play"
                                style={styles.button}
                                onPress={() => this.props.navigation.navigate('VideoPlayer', {
                                    video: lift.video,
                                    title: lift.exercise + ": " + lift.weight + " " + lift.unit + " for " + lift.reps + " rep(s) @ RPE " + lift.rpe + " on " + dateFormat(lift.date, "mmm d, yyyy")
                                })}>
                                <Icon name="play" />
                            </Button>
                            <Button
                                icon="close"
                                style={styles.button}
                                onPress={() => this.deleteLift(lift.id)}>
                                <Icon name="close" />
                            </Button>
                        </View>
                    </Tile>
                </ImageBackground >
                <Divider styleName="line" />
            </View>
        );
    }

    render() {
        const { lifts, loaded } = this.state;

        if (!loaded) {
            return <AppLoading />;
        }

        if (lifts.length === 0) {
            return (
                <LinearGradient
                    colors={['#EB3349', '#F45C43']}
                    style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ color: '#FFF', textAlign: 'center', marginTop: 50 }}>You don't have any saved lifts</Text>
                </LinearGradient>
            );
        }

        return (
            <Screen>
                <LinearGradient
                    colors={['#EB3349', '#F45C43']}
                    style={{ flex: 1, alignItems: 'center' }}>

                    <Toast
                        ref="toast"
                        positionValue={50} />

                    <ListView
                        data={lifts}
                        renderRow={this.renderRow}
                    />

                </LinearGradient>

            </Screen>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        margin: 5,
        textAlign: 'center'
    }
});

export default Recordings;