import React, { Component } from 'react';
import { StyleSheet, View, Button, Text, Alert, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Surface } from 'react-native-paper';
import Header from './Header';
import Database from './backend/Database';
const db = new Database();

export default class QrOutput extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: this.props.name,
            phone: this.props.phone,
            phone2: this.props.phone2,
            email: this.props.email,
            company: this.props.company,
            jobTitle: this.props.jobTitle,
            address: this.props.address,
            localDbRegistrationStatus: this.props.localDbRegistrationStatus,
            isLoading: false
        };
    }

    render() {
        let logoFromFile = require('../assets/logo.jpg');
        // let val = '{"CBName":"' + this.state.name + '","CBPhone":"' + this.state.phone + '"';
        let val = 'BEGIN:VCARD\nVERSION:4.0\nN:;' + this.state.name + ';;\nFN:' + this.state.name+'\nTEL;TYPE=CELL:'+this.state.phone+'\nREV:20121201T134211Z';
        if (this.state.phone2 != '') {
            val = val + '\nTEL;TYPE=CELL:' + this.state.phone2
        }
        if (this.state.email != '') {
            val = val + '\nEMAIL:' + this.state.email
        }
        if (this.state.company != '') {
            val = val + '\nORG:' + this.props.company
        }
        if (this.state.jobTitle != '') {
            val = val + '\nTITLE:' + this.props.jobTitle
        }
        if (this.state.address != '') {
            val = val + ' \nADR;TYPE=home:;;' + this.props.address
        }
        val = val + '\nEND:VCARD';
        return (
            <View style={styles.container}>
                <Header title="ConnectsBy" />
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <Surface style={styles.surfaceContainer}>
                        <Text style={styles.qrMessage}>Your QR Code </Text>
                        <View style={styles.qrcode}>
                            <QRCode
                                size={200}
                                value={val}
                                color="black"
                                enableLinearGradient='true'
                                linearGradient={['rgb(191, 0, 255)', 'rgb(0, 128, 255)']}
                                logo={logoFromFile}
                                logoSize={40}
                                logoBackgroundColor='transparent'
                            />
                        </View>
                        <View style={styles.editButton}>
                            <Button title="Edit" onPress={() => this.props.screenHandler('QrInput')} />
                        </View>
                    </Surface>
                </ScrollView>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    surfaceContainer: {
        flex: 1,
        margin: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 12
    },
    qrMessage: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 30
    },
    qrcode: {
        marginBottom: 30
    },
    editButton: {
        marginBottom: 10,
        width: '40%'
    }
}); 