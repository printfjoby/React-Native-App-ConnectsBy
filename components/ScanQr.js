import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import ScanScreen from './scan_screens/ScanScreen';
import WebpageAction from './scan_screens/WebpageAction';
import PhoneNumberAction from './scan_screens/PhoneNumberAction';
import SmsAction from './scan_screens/SmsAction';
import EmailAction from './scan_screens/EmailAction';
import VcardAction from './scan_screens/VcardAction';
import TextAction from './scan_screens/TextAction';
import PermissionScreen from './scan_screens/PermissionScreen';

const ScanStack = createStackNavigator();

export default class ScanQr extends Component {
    render() {
        return (
            <NavigationContainer>
                <ScanStack.Navigator initialRouteName="ScanScreen"
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: '#3399ff',
                        },
                        headerTintColor: '#fff',
                    }}
                >
                    <ScanStack.Screen name="ScanScreen" component={ScanScreen} options={{ title: 'Scan' }} />
                    <ScanStack.Screen name="WebpageAction" component={WebpageAction} options={{ title: 'Webpage' }} />
                    <ScanStack.Screen name="PhoneNumberAction" component={PhoneNumberAction} />
                    <ScanStack.Screen name="SmsAction" component={SmsAction} />
                    <ScanStack.Screen name="EmailAction" component={EmailAction} />
                    <ScanStack.Screen name="VcardAction" component={VcardAction} />
                    <ScanStack.Screen name="TextAction" component={TextAction} />
                    <ScanStack.Screen name="PermissionScreen" component={PermissionScreen} />
                </ScanStack.Navigator>
            </NavigationContainer>
        );
    }
}