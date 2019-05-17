import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Video } from 'expo';
import { MaterialIcons, Octicons } from '@expo/vector-icons';

class VideoPlayer extends React.Component {
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
                    <Text style={{ color: '#FFF', textAlign: 'center' }}> title </Text>
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