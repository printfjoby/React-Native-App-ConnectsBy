import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Communications from 'react-native-communications';
export default class PhoneNumber extends Component {
    constructor(props) {
        super(props);

        this.state = {
            phone: this.props.route.params.phoneNumber
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
        Communications.phonecall(this.state.phone, true);
    }

    render() {
        return (
            <Surface style={styles.container}>
                <Text style={styles.heading}>Qr Code Content </Text>
                <MaterialCommunityIcons style={styles.icon} size={40} name={'phone'} />

                <Text style={styles.type}>Phone Number</Text>

                <View style={styles.phoneContainer}>
                    <View style={styles.phoneIcon}>
                        <MaterialCommunityIcons size={26} name={'phone'} />
                    </View>
                    <TextInput style={styles.phone}
                        placeholder="Phone Number"
                        keyboardType="phone-pad"
                        value={this.state.phone}
                        onChangeText={value => this.handleChange(value, 'phone')}
                    />
                </View>

                <View style={styles.openButton}>
                    <Button title="Call" onPress={this.openAction} />
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
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 30
    },
    type: {
        fontSize: 18,
        fontWeight:"bold",
        marginBottom:20
    },
    phoneContainer: {
        flexDirection: "row"
    },
    phoneIcon: {
        flex: 2,
        justifyContent: "center",
        alignItems: "flex-end"
    },
    phone: {
        flex: 4,
        fontSize: 18,
    },
    openButton: {
        marginTop: 20,
        width: '50%'
    }
}); 