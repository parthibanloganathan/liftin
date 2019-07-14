import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { ScreenOrientation } from 'expo';
import { Video } from 'expo-av';

class VideoPlayer extends React.Component {
    componentWillMount() {
        ScreenOrientation.allowAsync(ScreenOrientation.Orientation.PORTRAIT_UP);
    }

    componentWillUnmount() {
        ScreenOrientation.allowAsync(ScreenOrientation.Orientation.ALL);
    }

    render() {
        const { width } = Dimensions.get('window');
        const video = this.props.navigation.getParam('video', null);
        const title = this.props.navigation.getParam('title', '');

        if (video === null) {
            return <Text style={{ color: '#FFF', textAlign: 'center', marginTop: 50 }}>Video not found :-(</Text>;
        }

        return (
            <View style={styles.container}>
                <View>
                    <Text style={{ color: '#FFF', textAlign: 'center', marginBottom: 20 }}> {title} </Text>
                    <Video
                        source={{ uri: video }}
                        resizeMode={Video.RESIZE_MODE_COVER}
                        style={{ width, height: 500 }}
                        isLooping
                        shouldPlay
                        useNativeControls={true}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        width: "100%",
        height: "100%"
    }
});

export default VideoPlayer;