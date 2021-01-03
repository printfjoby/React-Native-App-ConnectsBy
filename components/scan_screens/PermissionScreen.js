import React, { Component } from 'react';
import { StyleSheet, View, Text, Button, PermissionsAndroid, Platform } from 'react-native';
import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import { Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default class PermissionScreen extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.props.navigation.setOptions({
            headerTitle: () => { return (<Text style={styles.title} >Scan</Text>) },
        })
    }

    checkPermissionStatus = (result) => {
        switch (result) {
            case RESULTS.UNAVAILABLE:
                console.log('This feature is not available (on this device / in this context)');
                break;
            case RESULTS.DENIED:
                console.log('The permission has not been requested / is denied but requestable',);
                break;
            case RESULTS.GRANTED:
                console.log('The permission is granted');
                this.props.navigation.replace('ScanScreen');
                break;
            case RESULTS.BLOCKED:
                console.log('The permission is denied and not requestable anymore');
                break;
        }
    }

    requestPermission = () => {
        if (Platform.OS === 'ios') {
            request(PERMISSIONS.IOS.CAMERA).then((result) => {
                this.checkPermissionStatus(result);
            })
                .catch((error) => {
                    console.log(error);
                });
        } else if (Platform.OS === 'android') {
            request(PERMISSIONS.ANDROID.CAMERA).then((result) => {
                this.checkPermissionStatus(result);
            })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    render() {
        return (
            <Surface style={styles.container}>
                <Text style={styles.heading}> Scan with ConnectsBy</Text>
                <Button title="Start" onPress={this.requestPermission} />
            </Surface>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 12
    },
    title: {
        fontSize: 18,
        color: '#fff',
        fontWeight: "bold"
    },
    heading: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 20
    }
}); 