import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert, ActivityIndicator,ScrollView } from 'react-native';
import { Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Communications from 'react-native-communications';

export default class TextAction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            qrData: this.props.route.params.qrData
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

    render() {
        return (
            <Surface style={styles.container}>
                <Text style={styles.heading}>Qr Code Content </Text>
                <MaterialCommunityIcons style={styles.webIcon} size={40} name={'format-text'} />

                <Text style={styles.type}>Text</Text>
                <ScrollView>
                    <TextInput
                        style={styles.text}
                        placeholder="Text"
                        multiline={true}
                        numberOfLines={2}
                        value={this.state.qrData}
                        onChangeText={value => this.handleChange(value, 'qrData')}
                    />
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
    },
    type: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 10,
    },
    text: {
        fontSize: 18,
        marginTop:20,
        marginHorizontal:10,
        paddingHorizontal:10,
        paddingVertical:10,
        borderWidth:1,
        borderRadius:10,
        borderColor:"#3399ff"
    }
}); 