import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from './Header';
import Database from './backend/Database';
const db = new Database();

export default class QrInput extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.generateQrHandler = this.generateQrHandler.bind(this);
        this.storeData = this.storeData.bind(this);
        this.showMoreInput = this.showMoreInput.bind(this);

        this.state = {
            name: this.props.name,
            phone: this.props.phone,
            phone2: this.props.phone2,
            email: this.props.email,
            company: this.props.company,
            jobTitle: this.props.jobTitle,
            address: this.props.address,
            localDbRegistrationStatus: this.props.localDbRegistrationStatus,
            showMore: false,
            isLoading: false
        };
    }

    handleChange(value, key) {
        this.setState(prevState => ({
            ...prevState,
            [key]: value
        })
        );
    }

    showMoreInput(value) {
        this.setState({ showMore: value })
    }

    generateQrHandler() {

        if (this.state.name == '' || this.state.name == ' ') {
            Alert.alert('Unable to Submit', 'Please Enter Your Name', [{ text: 'Ok', style: 'default' }]);
            return;
        } else if (this.state.phone == '' || this.state.phone == ' ' || this.state.phone.length < 10) {
            Alert.alert('Unable to Submit', 'Please Enter a Valid Phone Number', [{ text: 'Ok', style: 'cancel' }]);
            return;
        }
        this.storeData();
    }

    storeData() {
        // this.setState({ isLoading: true })
        if (!this.state.localDbRegistrationStatus) {
            //add user to local database
            db.addUserDetails(this.state.name, this.state.phone, this.state.phone2, this.state.email,
                this.state.company, this.state.jobTitle, this.state.address).then((values) => {
                    this.setState({ localDbRegistrationStatus: 1 })
                    this.props.updateStateVariables(
                        this.state.name,
                        this.state.phone,
                        this.state.phone2,
                        this.state.email,
                        this.state.company,
                        this.state.jobTitle,
                        this.state.address,
                        this.state.localDbRegistrationStatus
                    )
                    this.props.screenHandler('QrOutput');
                }).catch((err) => {
                    console.log(err);
                    this.setState({ isLoading: false })
                    Alert.alert('Failed to save data', 'Please try again', [{ text: 'Ok', style: 'default' }]);
                })
        } else {
            //add local database
            db.updateUserDetails(this.state.name, this.state.phone, this.state.phone2, this.state.email,
                this.state.company, this.state.jobTitle, this.state.address).then((values) => {
                    this.props.updateStateVariables(
                        this.state.name,
                        this.state.phone,
                        this.state.phone2,
                        this.state.email,
                        this.state.company,
                        this.state.jobTitle,
                        this.state.address,
                        this.state.localDbRegistrationStatus
                    )
                    this.props.screenHandler('QrOutput');
                }).catch((err) => {
                    console.log(err);
                    this.setState({ isLoading: false })
                    Alert.alert('Failed to save data', 'Please try again', [{ text: 'Ok', style: 'default' }]);
                })
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <Header title="ConnectsBy" />
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
                    <Surface style={styles.surfaceContainer}>
                        <Text style={styles.inputMessage}>Enter Your Details </Text>
                        <View style={styles.inputContainer}>
                            <View style={styles.subInputContainer}>
                                <MaterialCommunityIcons style={styles.leftIcon} size={24} name={'account'} />
                                <TextInput
                                    label="Name"
                                    placeholder="Enter Your Name"
                                    autoCapitalize={'words'}
                                    style={styles.input}
                                    value={this.state.name}
                                    onChangeText={value => this.handleChange(value, 'name')}
                                />
                            </View>

                            <View style={styles.subInputContainer}>
                                <MaterialCommunityIcons style={styles.leftIcon} size={24} name={'phone'} />
                                <TextInput
                                    placeholder="Enter Phone Number"
                                    keyboardType="phone-pad"
                                    style={styles.input}
                                    value={this.state.phone}
                                    onChangeText={value => this.handleChange(value, 'phone')}
                                />
                            </View>
                            {
                                !this.state.showMore ?
                                    <TouchableOpacity style={styles.moreButton} onPress={() => this.showMoreInput(true)} >
                                        <Text style={styles.moreText}>More</Text>
                                    </TouchableOpacity>
                                    :
                                    <>
                                        <Text style={styles.optional}>(Optional Fields)</Text>
                                        <View style={styles.subInputContainer}>
                                            <MaterialCommunityIcons style={styles.leftIcon} size={24} name={'phone'} />
                                            <TextInput
                                                placeholder="Phone Number"
                                                keyboardType="phone-pad"
                                                style={styles.input}
                                                value={this.state.phone2}
                                                onChangeText={value => this.handleChange(value, 'phone2')}
                                            />
                                        </View>
                                        <View style={styles.subInputContainer}>
                                            <MaterialCommunityIcons style={styles.leftIcon} size={24} name={'email'} />
                                            <TextInput
                                                placeholder="Email Address"
                                                autoCapitalize={'none'}
                                                style={styles.input}
                                                value={this.state.email}
                                                onChangeText={value => this.handleChange(value, 'email')}
                                            />
                                        </View>
                                        <View style={styles.subInputContainer}>
                                            <MaterialCommunityIcons style={styles.leftIcon} size={24} name={'office-building'} />
                                            <TextInput
                                                placeholder="Organistion Name"
                                                autoCapitalize={'words'}
                                                style={styles.input}
                                                value={this.state.company}
                                                onChangeText={value => this.handleChange(value, 'company')}
                                            />
                                        </View>
                                        <View style={styles.subInputContainer}>
                                            <MaterialCommunityIcons style={styles.leftIcon} size={24} name={'account-details-outline'} />
                                            <TextInput
                                                placeholder="Job Title"
                                                autoCapitalize={'words'}
                                                style={styles.input}
                                                value={this.state.jobTitle}
                                                onChangeText={value => this.handleChange(value, 'jobTitle')}
                                            />
                                        </View>
                                        <View style={styles.subInputContainer}>
                                            <MaterialCommunityIcons style={styles.leftIcon} size={24} name={'alpha-a-circle-outline'} />
                                            <TextInput
                                                placeholder="Address "
                                                autoCapitalize={'words'}
                                                style={styles.input}
                                                value={this.state.address}
                                                onChangeText={value => this.handleChange(value, 'address')}
                                            />
                                        </View>
                                        <TouchableOpacity style={styles.moreButton} onPress={() => this.showMoreInput(false)} >
                                            <Text style={styles.moreText}>Show Less</Text>
                                        </TouchableOpacity>
                                    </>
                            }
                        </View>
                        <View style={styles.generateButton}>
                            <Button title="Generate QR" onPress={this.generateQrHandler} />
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
    inputMessage: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 20
    },
    inputContainer: {
        width: '80%'
    },
    subInputContainer: {
        flex: 1,
        flexDirection: 'row',
        marginBottom: 20,
        borderColor: 'black',
        borderBottomWidth: 1,
        alignItems: "center"
    },
    leftIcon: {
        flex: 1,
    },
    input: {
        flex: 7,
        paddingLeft: 5,
    },
    moreButton: {
        alignItems: "flex-end",
        fontSize: 16
    },
    moreText: {
        fontSize: 16,
        color: "#4da6ff"
    },
    optional: {
        fontSize: 16,
        color: "grey"
    },
    generateButton: {
        width: '50%',
        paddingTop: 16,
        marginBottom: 10
    }
}); 