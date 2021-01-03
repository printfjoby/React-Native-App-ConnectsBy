import React, { Component } from 'react';
import { StyleSheet, View, Text, Button, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Surface } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Database from '../backend/Database';

const db = new Database();

export default class ViewPersonInfo extends Component {
    constructor(props) {
        super(props);

        this.deleteHandler = this.deleteHandler.bind(this);

        this.state = {
            tableName: this.props.route.params.tableName,
            index_no: this.props.route.params.index_no,
            name: this.props.route.params.name,
            phone: this.props.route.params.phone,
            isLoading: false
        };
    }

    delete() {

        this.setState({
            isLoading: true
        });
        db.deletePerson(this.props.route.params.tableName, this.props.route.params.index_no).then((result) => {
            if (result.rowsAffected > 0) {

                Alert.alert('Success', 'Deleted Successfully', [{ text: 'Ok', onPress: () => this.props.navigation.navigate('TableContent'), style: 'default' }]);
            } else {
                this.setState({
                    isLoading: false
                });
                Alert.alert('Something Went Wrong', 'Please try again', [{ text: 'Ok', style: 'default' }]);
            }
        }).catch((err) => {
            console.log(err);
            this.setState({
                isLoading: false
            })
            Alert.alert('Something Went Wrong', 'Please try again', [{ text: 'Ok', style: 'default' }]);
        })


    }

    deleteHandler() {

        Alert.alert('Are you Sure?', 'Delete ' + this.props.route.params.name,
            [{ text: 'Delete', onPress: () => this.delete(), style: 'destructive' }, { text: 'Cancel', style: 'cancel' }]);
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
            <Surface style={styles.container}>
                <Text style={styles.details}>Details </Text>
                <View style={styles.itemContainer}>
                    <ScrollView >
                        <View style={styles.item}>
                            <MaterialCommunityIcons style={styles.leftIcon} size={26} name={'account'} />
                            <View style={styles.itemContent}>
                                <Text style={styles.heading}>Name :</Text>
                                <Text style={styles.text}>{this.state.name} </Text>
                            </View>
                        </View>
                        <View style={styles.item}>
                            <MaterialCommunityIcons style={styles.leftIcon} size={26} name={'phone'} />
                            <View style={styles.itemContent}>
                                <Text style={styles.heading}>Phone :</Text>
                                <Text style={styles.text}>{this.state.phone} </Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>

                <View style={styles.buttons}>
                    <View style={styles.buttonStyle}>
                        <Button title="Delete" onPress={this.deleteHandler} />
                    </View>
                    <View style={styles.buttonStyle}>
                        <Button title="Edit" onPress={() => this.props.navigation.navigate('EditPersonInfo',
                            {
                                tableName: this.state.tableName,
                                index_no: this.state.index_no,
                                name: this.state.name,
                                phone: this.state.phone,
                            })} />
                    </View>
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
    activity: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    details: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 20
    },
    itemContainer: {
        width: '95%',
        height: 150
    },
    item: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        paddingLeft: 10,
        paddingVertical: 10,
        alignItems: "center"
    },
    leftIcon: {
        flex: 1
    },
    itemContent: {
        flex: 7,
        paddingLeft: 5
    },
    heading: {
        fontSize: 16,
    },
    text: {
        fontSize: 18,
        paddingTop: 5,
    },
    buttons: {
        width: '80%',
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: 20
    },
    buttonStyle: {
        width: '30%'
    }
}); 