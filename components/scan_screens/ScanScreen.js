import React, { Component } from 'react';
import { StyleSheet, Text, View, Alert, Platform } from 'react-native';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import HistoryDatabase from '../backend/HistoryDatabase';
import { withSafeAreaInsets } from 'react-native-safe-area-context';

const db = new HistoryDatabase();

export default class ScanScreen extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.checkPermission();
        this.focusListner = this.props.navigation.addListener("focus", () => {
            this.scanner.reactivate();
        })
        this.props.navigation.setOptions({
            headerTitle: () => { return (<Text style={styles.title} >Scan QR Code</Text>) },
        })
    }

    checkPermissionStatus = (result) => {
        switch (result) {
            case RESULTS.UNAVAILABLE:
                console.log('This feature is not available (on this device / in this context)');
                this.props.navigation.replace('PermissionScreen');
                break;
            case RESULTS.DENIED:
                console.log('The permission has not been requested / is denied but requestable');
                this.props.navigation.replace('PermissionScreen');
                break;
            case RESULTS.GRANTED:
                console.log('The permission is granted');
                break;
            case RESULTS.BLOCKED:
                console.log('The permission is denied and not requestable anymore');
                this.props.navigation.replace('PermissionScreen');
                break;
        }
    }

    checkPermission = () => {
        if (Platform.OS === 'ios') {
            check(PERMISSIONS.IOS.CAMERA)
                .then((result) => {
                    this.checkPermissionStatus(result)
                })
                .catch((error) => {
                    console.log(error);
                });
        } else if (Platform.OS === 'android') {
            check(PERMISSIONS.ANDROID.CAMERA)
                .then((result) => {
                    this.checkPermissionStatus(result)
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    onSuccess = e => {
        try {
            var qrData = e.data;
            if (qrData.startsWith('BEGIN:VCARD')) {
                db.addToHistory(1, qrData).then((res) => {
                    console.log("Added V-card to history")
                })
                this.props.navigation.navigate('VcardAction',
                    {
                        qrData: qrData
                    })
            } else if (qrData.startsWith('http://') || qrData.startsWith('https://')) {
                db.addToHistory(2, qrData).then((res) => {
                    console.log("Added to history")
                })
                this.props.navigation.navigate('WebpageAction',
                    {
                        URL: qrData
                    })
            } else if (qrData.startsWith('tel:')) {
                let phoneNumber = qrData.split(":")[1]
                db.addToHistory(3, phoneNumber).then((res) => {
                    console.log("Added Phone Number to history")
                })
                this.props.navigation.navigate('PhoneNumberAction',
                    {
                        phoneNumber: phoneNumber
                    })
            } else if (qrData.startsWith('SMSTO:')) {
                db.addToHistory(4, qrData).then((res) => {
                    console.log("Added SMS to history")
                })
                let qrDataSplit = qrData.split(":");
                let phoneNumber = qrDataSplit[1];
                let msgBody = qrDataSplit[2];
                this.props.navigation.navigate('SmsAction',
                    {
                        phoneNumber: phoneNumber,
                        msgBody: msgBody
                    })
            } else if (qrData.startsWith('mailto:') || qrData.startsWith('MATMSG:TO:')) {
                let mailId, subject, body;
                if (qrData.startsWith('mailto:')) {
                    mailId = qrData.match(new RegExp("mailto:(.*)\\?subject="));
                    mailId = mailId[1];
                    subject = qrData.match(new RegExp("\\?subject=(.*)&body="));
                    subject = subject[1];
                    body = qrData.match(new RegExp("&body=(.*)"));
                    body = body[1];
                } else if (qrData.startsWith('MATMSG:TO:')) {
                    mailId = qrData.match(new RegExp("MATMSG:TO:(.*);SUB:"));
                    mailId = mailId[1];
                    subject = qrData.match(new RegExp(";SUB:(.*);BODY:"));
                    subject = subject[1];
                    body = qrData.match(new RegExp(";BODY:(.*);;"));
                    body = body[1];
                }
                db.addToHistory(5, qrData).then((res) => {
                    console.log("Added Mail to history")
                })
                this.props.navigation.navigate('EmailAction',
                    {
                        mailId: mailId,
                        subject: subject,
                        body: body
                    })
            } else {
                db.addToHistory(6, qrData).then((res) => {
                    console.log("Added Text to history")
                })
                this.props.navigation.navigate('TextAction',
                    {
                        qrData: qrData
                    })
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Failed to Read',
                'Please Retry',
                [{ text: 'Ok', onPress: () => this.scanner.reactivate(), style: 'default' }]);
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.scannerContainer}>
                    <QRCodeScanner
                        onRead={this.onSuccess}
                        fadeIn={false}
                        showMarker={true}
                        markerStyle={{ borderColor: "#fff" }}
                        flashMode={RNCamera.Constants.FlashMode.off}
                        ref={(node) => { this.scanner = node }}
                        containerStyle={{
                            alignItems: 'center'
                        }}
                        // cameraStyle={{ width: 220, height: 220 }}
                        bottomContent={
                            <Text style={styles.msg}>
                                Place the QR Code inside the frame
                            </Text>
                        }
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        textAlign: "center",
        color: '#fff',
        fontWeight: "bold"
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000'
    },
    scannerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    msg: {
        paddingTop: 30,
        color: "#fff"
    }
});