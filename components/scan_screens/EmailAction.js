import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Communications from 'react-native-communications';
export default class EmailAction extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mailId: this.props.route.params.mailId,
            subject: this.props.route.params.subject,
            body: this.props.route.params.body
        };
    }

    componentDidMount() {
        this.props.navigation.setOptions({
            headerTitle: () => { return (<Text style={styles.title} >Scan Result</Text>) },
        })
    }
    openAction = () => {
        Communications.email([this.state.mailId], null, null, this.state.subject, this.state.body)
    }

    handleChange(value, key) {
        this.setState(prevState => ({
            ...prevState,
            [key]: value
        })
        );
    }
    render() {
        return (
            <Surface style={styles.container}>
                <ScrollView>
                    <View style={styles.viewContainer}>
                        <Text style={styles.details}>Qr Code Content </Text>
                        <MaterialCommunityIcons style={styles.icon} size={40} name={'email-outline'} />
                        <Text style={styles.type}>E-mail</Text>
                        <View style={styles.idContainer}>
                            <Text style={styles.to}>To:</Text>
                            <Text style={styles.mailId}>{this.props.route.params.mailId} </Text>
                        </View>
                        <Text style={styles.sub}>Subject:</Text>
                        <TextInput
                            style={styles.subject}
                            placeholder="Please Enter The Mail Subject"
                            multiline={true}
                            numberOfLines={3}
                            value={this.state.subject}
                            onChangeText={value => this.handleChange(value, 'subject')}
                        />
                        <Text style={styles.bodyTitle}>Body:</Text>
                        <TextInput
                            style={styles.body}
                            placeholder="Please Enter The Mail Body   "
                            multiline={true}
                            numberOfLines={3}
                            value={this.state.body}
                            onChangeText={value => this.handleChange(value, 'body')}
                        />
                        <View style={styles.openButton}>
                            <Button title="Send" onPress={this.openAction} />
                        </View>
                    </View>
                </ScrollView>
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
    viewContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        color: '#fff',
        fontWeight: "bold"
    },
    details: {
        fontSize: 22,
        fontWeight: "bold",
        marginTop: 20,
        marginBottom: 20
    },
    type: {
        fontSize: 18,
        fontWeight: "bold"
    },
    idContainer: {
        flexDirection: "row",
        marginVertical: 10,
    },
    to: {
        fontSize: 18,
        fontWeight: "bold"
    },
    mailId: {
        fontSize: 18,
        paddingLeft: 10
    },
    sub: {
        fontSize: 18,
        fontWeight: "bold"
    },
    subject: {
        fontSize: 18,
        marginTop: 10,
        marginHorizontal: 10,
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#3399ff"
    },
    bodyTitle: {
        fontSize: 18,
        marginTop: 10,
        fontWeight: "bold"
    },
    body: {
        fontSize: 18,
        marginTop: 10,
        marginHorizontal: 10,
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#3399ff"
    },
    openButton: {
        marginTop: 20,
        marginBottom: 20,
        width: '50%'
    }
}); 