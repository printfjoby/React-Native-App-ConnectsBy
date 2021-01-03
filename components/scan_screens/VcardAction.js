import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert, ActivityIndicator, Platform } from 'react-native';
import { PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import { Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Contacts from 'react-native-contacts';

export default class VcardAction extends Component {
    constructor(props) {
        super(props);

        this.state = {
            qrData: this.props.route.params.qrData,
            contactData: {}
        };
    }

    componentDidMount() {
        this.processQrData();
        this.props.navigation.setOptions({
            headerTitle: () => { return (<Text style={styles.title} >Scan Result</Text>) },
        })
    }

    processQrData = () => {
        let qrData = this.state.qrData;
        let infoArray;
        let phoneNumbers = [];
        let postalAddresses = [];
        let emailAddresses = [];
        let contactData = {};
        infoArray = qrData.split("\n");
        infoArray.forEach(element => {
            if (element.startsWith("FN:")) {
                let name = element.match(new RegExp("FN:(.*)"));
                if (name[1] != '') {
                    contactData['displayName'] = name[1];
                }
            } else if (element.startsWith("N:")) {
                let name;
                if (element.includes(";")) {
                    let firstName = element.match(new RegExp(";(.*?)(;|$)"));
                    let lastName = element.match(new RegExp("N:(.*?);"));
                    if (lastName[1]) {
                        name = firstName[1].concat(" ".concat(lastName[1]));
                    } else {
                        name = firstName[1]
                    }
                } else {
                    name = element.match(new RegExp("N:(.*)"));
                    name = name[1];
                }
                contactData['displayName'] = name;
            } else if (element.startsWith("TEL")) {
                let mobNumber;
                if (element.includes("VALUE:")) {
                    mobNumber = element.match(new RegExp("tel:(.*)"));
                } else {
                    mobNumber = element.match(new RegExp(":(.*)"));
                }
                let label = 'mobile';
                if (element.includes("WORK")) {
                    label = 'work'
                } else if (element.includes("FAX")) {
                    label = 'work fax'
                } else if (element.includes("HOME")) {
                    label = 'home'
                }
                phoneNumbers.push({
                    label: label,
                    number: mobNumber[1]
                })
            } else if (element.startsWith("ORG:")) {
                let org = element.match(new RegExp("ORG:(.*)"));
                contactData['company'] = org[1];
            } else if (element.startsWith("TITLE:")) {
                let title = element.match(new RegExp("TITLE:(.*)"));
                contactData['jobTitle'] = title[1];
            } else if (element.startsWith("EMAIL")) {
                let email = element.match(new RegExp(":(.*)"));
                let label = 'work';
                if (element.includes("HOME")) {
                    label = 'home';
                }
                emailAddresses.push({
                    label: label,
                    email: email[1]
                })
            } else if (element.startsWith("BDAY")) {
                let dob = element.match(new RegExp(":(.*)"));
                dob = dob[1];
                contactData['birthday'] = {
                    'year': parseInt(dob.substring(0, 4)),
                    'month': parseInt(dob.substring(4, 6)), 'day': parseInt(dob.substring(6, 8))
                };
            } else if (element.startsWith("ADR")) {
                let addr;
                if (element.includes(";;")) {
                    addr = element.match(new RegExp(";;(.*)"));
                } else {
                    addr = element.match(new RegExp(":(.*)"));
                }

                addr = addr[1];
                addr = addr.split(";");
                let addrs = "";
                addr.forEach(item => {
                    addrs = addrs.concat(item.concat("\n"));
                })
                let label = 'work'
                if (element.includes("HOME")) {
                    label = 'home'
                }
                postalAddresses.push({
                    'label': label,
                    'formattedAddress': addrs,
                    'street': '',
                    'pobox': '',
                    'neighborhood': '',
                    'city': '',
                    'region': '',
                    'state': '',
                    'postCode': '',
                    'country': '',
                });
            }
            //console.log(element);
        });
        contactData['phoneNumbers'] = phoneNumbers;
        contactData['emailAddresses'] = emailAddresses;
        contactData['postalAddresses'] = postalAddresses;
        this.setState({
            contactData: contactData
        })
        //console.log(contactData)
    }

    checkPermissionStatus = (result) => {
        let contactData = this.state.contactData;
        switch (result) {
            case RESULTS.UNAVAILABLE:
                console.log('This feature is not available (on this device / in this context)');
                break;
            case RESULTS.DENIED:
                console.log('The permission has not been requested / is denied but requestable',);
                break;
            case RESULTS.GRANTED:
                console.log('The permission is granted');
                Contacts.openContactForm(contactData, (err, contact) => {
                    if (err) {
                        Alert.alert('Something Went Wrong', 'Please try again', [{ text: 'Ok', style: 'default' }]);
                    }
                }
                )
                break;
            case RESULTS.BLOCKED:
                console.log('The permission is denied and not requestable anymore');
                break;
        }
    }

    openAction = () => {
        let contactData = this.state.contactData;
        if (Platform.OS === 'ios') {
            request(PERMISSIONS.IOS.CONTACTS).then((result) => {
                this.checkPermissionStatus(result);
            })
                .catch((error) => {
                    console.log(error);
                });
        } else if (Platform.OS === 'android') {
            request(PERMISSIONS.ANDROID.READ_CONTACTS).then((result) => {
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
                <Text style={styles.details}>Qr Code Content </Text>
                <MaterialCommunityIcons style={{ color: "#808080" }} size={40} name={'account'} />
                <Text style={styles.type}>Contact</Text>
                {
                    this.state.contactData.displayName !== "" ?
                        <>
                            <Text style={styles.label} >Name : </Text>
                            <Text style={styles.content} >{this.state.contactData.displayName}</Text>
                        </>
                        :
                        <>
                            <Text style={styles.label} >Name : </Text>
                            <Text style={styles.content} >{this.state.contactData.company}</Text>
                        </>

                }

                <View style={styles.openButton}>
                    <Button title="View / Add to Contact" onPress={this.openAction} />
                </View>
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
    details: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 20
    },
    type: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 30,
        color: "#808080"
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#808080"
    },
    content: {
        fontSize: 16,
    },
    openButton: {
        marginTop: 20,
        width: '50%'
    }
}); 