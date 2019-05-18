// Base copied from https://github.com/expo/camerja/blob/master/App.js
import { Constants, Camera, FileSystem, Permissions, BarCodeScanner } from 'expo';
import React from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Slider,
    Platform
} from 'react-native';

import {
    Ionicons,
    MaterialIcons,
    Foundation,
    MaterialCommunityIcons,
    Octicons
} from '@expo/vector-icons';

const landmarkSize = 2;

const flashModeOrder = {
    off: 'on',
    on: 'auto',
    auto: 'torch',
    torch: 'off',
};

const flashIcons = {
    off: 'flash-off',
    on: 'flash-on',
    auto: 'flash-auto',
    torch: 'highlight'
};

const wbOrder = {
    auto: 'sunny',
    sunny: 'cloudy',
    cloudy: 'shadow',
    shadow: 'fluorescent',
    fluorescent: 'incandescent',
    incandescent: 'auto',
};

const wbIcons = {
    auto: 'wb-auto',
    sunny: 'wb-sunny',
    cloudy: 'wb-cloudy',
    shadow: 'beach-access',
    fluorescent: 'wb-iridescent',
    incandescent: 'wb-incandescent',
};

export default class VideoCamera extends React.Component {
    state = {
        flash: 'off',
        zoom: 0,
        recording: false,
        autoFocus: 'on',
        type: 'back',
        whiteBalance: 'auto',
        ratio: '16:9',
        ratios: [],
        permissionsGranted: false,
    };

    async componentWillMount() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA, Permissions.AUDIO_RECORDING);
        this.setState({ permissionsGranted: status === 'granted' });
    }

    componentDidMount() {
        FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'videos').catch(e => {
            // console.log(e, 'Directory exists');
        });
    }

    getRatios = async () => {
        const ratios = await this.camera.getSupportedRatios();
        return ratios;
    };

    toggleView = () => this.setState({ showGallery: !this.state.showGallery, newPhotos: false });

    toggleFacing = () => this.setState({ type: this.state.type === 'back' ? 'front' : 'back' });

    toggleFlash = () => this.setState({ flash: flashModeOrder[this.state.flash] });

    setRatio = ratio => this.setState({ ratio });

    toggleWB = () => this.setState({ whiteBalance: wbOrder[this.state.whiteBalance] });

    toggleFocus = () => this.setState({ autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on' });

    zoomOut = () => this.setState({ zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1 });

    zoomIn = () => this.setState({ zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1 });

    setFocusDepth = depth => this.setState({ depth });

    startVideo = async () => {
        if (this.camera) {
            this.setState({ recording: true });
            this.camera.recordAsync().then(async (video) => {
                var newLocation = `${FileSystem.documentDirectory}videos/${Date.now()}.mp4`;
                await FileSystem.moveAsync({
                    from: video.uri,
                    to: newLocation,
                }).then(() => {
                    this.props.navigation.state.params.onVideoTaken(newLocation);
                    this.props.navigation.goBack();
                });
            });
        }
    };

    stopVideo = async () => {
        if (this.camera) {
            this.setState({ recording: false });
            this.camera.stopRecording();
        }
    }

    handleMountError = ({ message }) => console.error(message);

    renderNoPermissions = () =>
        <View style={styles.noPermissions}>
            <Text style={{ color: 'white' }}>
                Camera permissions not granted - cannot open camera preview.
      </Text>
        </View>

    renderTopBar = () =>
        <View
            style={styles.topBar}>
            <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFacing}>
                <Ionicons name="ios-reverse-camera" size={32} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFocus}>
                <Text style={[styles.autoFocusLabel, { color: this.state.autoFocus === 'on' ? "white" : "#6b6b6b" }]}>AF</Text>
            </TouchableOpacity>
        </View>

    renderBottomBar = () =>
        <View
            style={styles.bottomBar}>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
                <TouchableOpacity style={styles.bottomButton} onPress={this.zoomOut}>
                    <Text style={[styles.autoFocusLabel, { color: 'white' }]}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        this.state.recording ? this.stopVideo() : this.startVideo()
                    }}
                    style={{ alignSelf: 'center' }}
                >
                    {this.state.recording ? <Ionicons name="ios-radio-button-on" size={70} color="red" /> : <Ionicons name="ios-radio-button-on" size={70} color="white" />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomButton} onPress={this.zoomIn}>
                    <Text style={[styles.autoFocusLabel, { color : 'white' }]}>+</Text>
                </TouchableOpacity>
            </View>
        </View>

    renderCamera = () =>
        (
            <View style={{ flex: 1 }}>
                <Camera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style={styles.camera}
                    onCameraReady={this.collectPictureSizes}
                    type={this.state.type}
                    flashMode={this.state.flash}
                    autoFocus={this.state.autoFocus}
                    zoom={this.state.zoom}
                    whiteBalance={this.state.whiteBalance}
                    ratio={this.state.ratio}
                    onMountError={this.handleMountError}
                >
                    {/* {this.renderTopBar()} */}
                    {this.renderBottomBar()}
                </Camera>
            </View>
        );

    render() {
        const cameraScreenContent = this.state.permissionsGranted
            ? this.renderCamera()
            : this.renderNoPermissions();
        const content = cameraScreenContent;
        return <View style={styles.container}>{content}</View>;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
        justifyContent: 'space-between',
    },
    topBar: {
        flex: 0.2,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: Constants.statusBarHeight / 2,
    },
    bottomBar: {
        paddingBottom: 5,// isIPhoneX ? 25 : 5,
        backgroundColor: 'transparent',
        alignSelf: 'flex-end',
        justifyContent: 'space-between',
        flex: 0.12,
        flexDirection: 'row',
    },
    noPermissions: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    gallery: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    toggleButton: {
        flex: 0.25,
        height: 40,
        marginHorizontal: 2,
        marginBottom: 10,
        marginTop: 20,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    autoFocusLabel: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    bottomButton: {
        flex: 0.3,
        height: 58,
        justifyContent: 'center',
        alignItems: 'center',
    },
    newPhotosDot: {
        position: 'absolute',
        top: 0,
        right: -5,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4630EB'
    },
    options: {
        position: 'absolute',
        bottom: 80,
        left: 30,
        width: 200,
        height: 160,
        backgroundColor: '#000000BA',
        borderRadius: 4,
        padding: 10,
    },
    detectors: {
        flex: 0.5,
        justifyContent: 'space-around',
        alignItems: 'center',
        flexDirection: 'row',
    },
    pictureQualityLabel: {
        fontSize: 10,
        marginVertical: 3,
        color: 'white'
    },
    pictureSizeContainer: {
        flex: 0.5,
        alignItems: 'center',
        paddingTop: 10,
    },
    pictureSizeChooser: {
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    pictureSizeLabel: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    facesContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        top: 0,
    },
    face: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 2,
        position: 'absolute',
        borderColor: '#FFD700',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    landmark: {
        width: landmarkSize,
        height: landmarkSize,
        position: 'absolute',
        backgroundColor: 'red',
    },
    faceText: {
        color: '#FFD700',
        fontWeight: 'bold',
        textAlign: 'center',
        margin: 10,
        backgroundColor: 'transparent',
    },
    row: {
        flexDirection: 'row',
    },
});