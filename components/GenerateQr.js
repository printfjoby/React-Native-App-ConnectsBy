import React, { Component } from 'react';
import { StyleSheet, Alert } from 'react-native';
import QrInput from './QrInput';
import QrOutput from './QrOutput';
import Database from './backend/Database';
const db = new Database();

export default class GenerateQR extends Component {
    constructor(props) {
        super(props);
        this.setScreen = this.setScreen.bind(this);
        this.screenHandler = this.screenHandler.bind(this);
        this.updateStateVariables = this.updateStateVariables.bind(this);

        this.state = {
            name: '',
            phone: '',
            phone2: '',
            email: '',
            company: '',
            jobTitle: '',
            address: '',
            screen: '',
            localDbRegistrationStatus: false,
            isLoading: false
        };
    }

    componentDidMount() {
        this.setScreen();
    }

    //Set initial screen
    setScreen() {
        this.setState({ isLoading: true });
        db.getUserDetails().then((values) => {
            if (values === undefined) {
                this.setState({
                    screen: 'QrInput'
                });
            } else {
                if (values.phone2 !== undefined) {
                    this.setState({
                        phone2: values.phone2
                    });
                }
                if (values.email !== undefined) {
                    this.setState({
                        email: values.email
                    });
                }
                if (values.company !== undefined) {
                    this.setState({
                        company: values.company
                    });
                }
                if (values.jobTitle !== undefined) {
                    this.setState({
                        jobTitle: values.jobTitle
                    });
                }
                if (values.address !== undefined) {
                    this.setState({
                        address: values.address
                    });
                }
                this.setState({
                    name: values.name,
                    phone: values.phone,
                    localDbRegistrationStatus: true,
                    screen: 'QrOutput'
                });
            }
        }).catch((err) => {
            console.log(err);
            this.setState({ isLoading: false });
            Alert.alert('Something Went Wrong', 'Please try again', [{ text: 'Ok', style: 'default' }]);
        })
    }
    //Used to switch between QrInput and QrOutPut Screen
    updateStateVariables(name, phone, phone2, email, company, jobTitle, address, localDbRegistrationStatus) {
        this.setState({
            name: name,
            phone: phone,
            phone2: phone2,
            email: email,
            company: company,
            jobTitle: jobTitle,
            address: address,
            localDbRegistrationStatus: localDbRegistrationStatus
        });

    }
    screenHandler(screen) {
        this.setState({
            screen: screen
        });
    }

    render() {
        return (
            this.state.screen === 'QrInput' ?
                <QrInput
                    name={this.state.name}
                    phone={this.state.phone}
                    phone2={this.state.phone2}
                    email={this.state.email}
                    company={this.state.company}
                    jobTitle={this.state.jobTitle}
                    address={this.state.address}
                    localDbRegistrationStatus={this.state.localDbRegistrationStatus}
                    updateStateVariables={this.updateStateVariables}
                    screenHandler={this.screenHandler}
                />
                :
                this.state.screen === 'QrOutput' ?
                    <QrOutput
                        name={this.state.name}
                        phone={this.state.phone}
                        phone2={this.state.phone2}
                        email={this.state.email}
                        company={this.state.company}
                        jobTitle={this.state.jobTitle}
                        address={this.state.address}
                        screenHandler={this.screenHandler}
                    />
                    :
                    null
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
}); 