import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import TableList from './list/TableList';
import TableContent from './list/TableContent';
import ListQrScan from './list/ListQrScan';
import ListScanData from './list/ListScanData';
import ListInsertData from './list/ListInsertData';
import ViewPersonInfo from './list/ViewPersonInfo';
import EditPersonInfo from './list/EditPersonInfo';
import ExportsList from './list/ExportsList';

const Stack = createStackNavigator();

export default class List extends Component {
    render() {
        return (
            <NavigationContainer>
                <Stack.Navigator initialRouteName="TableList" 
                    screenOptions={{
                        headerStyle: {
                          backgroundColor: '#3399ff',
                        },
                        headerTintColor: '#fff',
                      }}
                >
                    <Stack.Screen name="TableList" component={TableList} options={{ title: 'Lists' }}/>
                    <Stack.Screen name="TableContent" component={TableContent} />
                    <Stack.Screen name="ListQrScan" component={ListQrScan} options={{ title: 'Scan Qr Code' }} />
                    <Stack.Screen name="ListScanData" component={ListScanData} />
                    <Stack.Screen name="ListInsertData" component={ListInsertData} options={{ title: 'Add New Person' }} />
                    <Stack.Screen name="ViewPersonInfo" component={ViewPersonInfo} options={{ title: 'View' }} />
                    <Stack.Screen name="EditPersonInfo" component={EditPersonInfo} options={{ title: 'Edit' }} />
                    <Stack.Screen name="ExportsList" component={ExportsList} />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }
}