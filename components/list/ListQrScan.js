import React, { Component } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

export default class ListQrScan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableName: this.props.route.params.tableName,
            name: '',
            phone: ''
        };

    }
    componentDidMount() {
        this.focusListner = this.props.navigation.addListener("focus", () => {
            this.scanner.reactivate();
        })
    }
    onSuccess = e => {
        try {
            var qrData = e.data
            if (!qrData.startsWith('BEGIN:VCARD') || !qrData.includes('REV:20121201T134211Z')) {
                throw (err);
            }
            let infoArray;
            let name;
            let phone;
            let flag = true;
            infoArray = qrData.split("\n");
            infoArray.forEach(element => {
                if (element.startsWith("FN:")) {
                    let fn = element.match(new RegExp("FN:(.*)"));
                    name = fn[1];
                }
                if (element.startsWith("TEL") && flag) {
                    let mobNumber;
                    if (element.includes("VALUE:")) {
                        mobNumber = element.match(new RegExp("tel:(.*)"));
                    } else {
                        mobNumber = element.match(new RegExp(":(.*)"));
                    }
                    phone = mobNumber[1];
                    flag = false;
                }
            });
            console.log(phone)
            this.props.navigation.navigate('ListScanData', { tableName: this.state.tableName, name: name, phone: phone })
        } catch (err) {
            console.log(err)
            Alert.alert('Unsupported Qr Code',
                'Please scan a Qr Code from ConnectsBy App',
                [{ text: 'Ok', onPress: () => this.scanner.reactivate(), style: 'default' }]);
        }
    }
    render() {
        return (
            <View style={styles.container}>
                <QRCodeScanner
                    onRead={this.onSuccess}
                    fadeIn={false}
                    showMarker={true}
                    markerStyle={{ borderColor: "#fff" }}
                    flashMode={RNCamera.Constants.FlashMode.off}
                    ref={(node) => { this.scanner = node }}
                    bottomContent={
                        <Text style={styles.msg}>
                            Place the QR Code inside the frame
                    </Text>
                    }
                />
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000'
    },
    msg: {
        paddingTop: 30,
        color: "#fff"
    }
});