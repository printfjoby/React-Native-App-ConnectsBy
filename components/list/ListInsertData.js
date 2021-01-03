import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Database from '../backend/Database';

const db = new Database();

export default class ListInsertData extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.saveHandler = this.saveHandler.bind(this);

        this.state = {
            name: "",
            phone: "",
            tableName: this.props.route.params.tableName,
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

    saveHandler() {

        if (this.state.name == '' || this.state.name == ' ') {
            Alert.alert('Unable to Submit', 'Please Enter Name', [{ text: 'Ok', style: 'default' }]);
            return;
        } else if (this.state.phone == '' || this.state.phone == ' ' || this.state.phone.length < 10) {
            Alert.alert('Unable to Submit', 'Please Enter a Valid Phone Number', [{ text: 'Ok', style: 'default' }]);
            return;
        }
        this.setState({
            isLoading: true
        });

        db.addPerson(this.state.tableName, this.state.name, this.state.phone).then((result) => {
            Alert.alert('Success', 'Added Successfully', [{ text: 'Ok', onPress: () => this.props.navigation.navigate('TableContent'), style: 'default' }]);
        }).catch((err) => {
            console.log(err)
            this.setState({
                isLoading: false
            });
            Alert.alert('Something Went Wrong', 'Please try again', [{ text: 'Ok', style: 'default' }]);
        })

    }

    render() {

        if (this.state.isLoading) {
            return (
                <View style={styles.activity}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )
        }

        return (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
                <Surface style={styles.container}>
                    <Text style={styles.inputMessage}>Insert Details </Text>
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
                    </View>
                    <View style={styles.buttons}>
                        <View style={styles.buttonStyle}>
                            <Button title="Cancel" onPress={() => this.props.navigation.navigate('TableContent')} />
                        </View>
                        <View style={styles.buttonStyle}>
                            <Button title="Save" onPress={this.saveHandler} />
                        </View>
                    </View>
                </Surface>
            </ScrollView>
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
    activity: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
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
    buttons: {
        width: '80%',
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: 20
    },
    buttonStyle: {
        marginBottom: 10,
        width: '30%'
    }
}); 