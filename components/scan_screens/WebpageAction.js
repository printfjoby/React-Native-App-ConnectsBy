import React, { Component } from 'react';
import { StyleSheet, View, Text, TextInput, Button, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Communications from 'react-native-communications';

export default class WebpageAction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: this.props.route.params.URL
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

    openWebpageHandler = () => {
        Communications.web(this.state.url);
    }

    render() {
        return (
            <Surface style={styles.container}>
                <Text style={styles.heading}>Qr Code Content </Text>
                <MaterialCommunityIcons style={styles.webIcon} size={40} name={'web'} />

                <Text style={styles.type}> Website</Text>
                <ScrollView>
                    <TextInput
                        style={styles.url}
                        placeholder="Please Enter a Valid Website URL"
                        multiline={true}
                        numberOfLines={2}
                        value={this.state.url}
                        onChangeText={value => this.handleChange(value, 'url')}
                    />
                </ScrollView>

                <View style={styles.openButton}>
                    <Button title="Open Webpage" onPress={this.openWebpageHandler} />
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
        marginBottom: 20
    },
    type: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 10,
    },
    url: {
        fontSize: 18,
        marginTop: 20,
        marginHorizontal: 10,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#3399ff"

    },
    openButton: {
        marginVertical: 20,
        width: '50%'
    }
}); 