import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Communications from 'react-native-communications';
export default class SmsAction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            phone: this.props.route.params.phoneNumber,
            msgBody: this.props.route.params.msgBody
        };
    }

    componentDidMount() {
        this.props.navigation.setOptions({
            headerTitle: () => { return (<Text style={styles.title} >Scan Result</Text>) },
        })
    }

    handleChange(value, key) {
        this.setState(prevState => ({
            ...prevState,
            [key]: value
        })
        );
    }

    openAction = () => {
        Communications.text(this.state.phone, this.state.msgBody)
    }

    render() {
        return (
            <Surface style={styles.container}>
                <Text style={styles.heading}>Qr Code Content </Text>
                <MaterialCommunityIcons style={styles.icon} size={40} name={'message-text-outline'} />

                <Text style={styles.type}>SMS</Text>
                <View style={styles.numberContainer}>
                    <Text style={styles.to}>To:</Text>
                    <TextInput
                        style={styles.phno}
                        value={this.state.phone}
                        keyboardType="phone-pad"
                        onChangeText={value => this.handleChange(value, 'phone')}
                    />
                </View>
                <Text style={styles.content}>Content:</Text>
                <ScrollView>
                    <TextInput
                        style={styles.msgBody}
                        placeholder="Please Enter The Message Content"
                        multiline={true}
                        numberOfLines={3}
                        value={this.state.msgBody}
                        onChangeText={value => this.handleChange(value, 'msgBody')}
                    />
                </ScrollView>
                <View style={styles.openButton}>
                    <Button title="Send" onPress={this.openAction} />
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
    heading: {
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 20
    },
    type: {
        fontSize: 18,
        fontWeight: "bold"
    },
    numberContainer: {
        flexDirection: "row",
        marginVertical: 10,
        justifyContent: "center",
        alignItems: "center"
    },
    to: {
        fontSize: 18,
        fontWeight: "bold",
    },
    phno: {
        fontSize: 18,
        paddingLeft: 10
    },
    content: {
        fontSize: 18,
        fontWeight: "bold"
    },
    msgBody: {
        fontSize: 18,
        marginVertical: 10,
        marginHorizontal: 10,
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#3399ff"
    },
    openButton: {
        marginBottom: 20,
        width: '50%'
    }
}); 