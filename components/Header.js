import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Menu, { MenuItem } from 'react-native-material-menu';
import Communications from 'react-native-communications';

const Header = props => {

    setMenuRef = ref => {
        this._menu = ref;
    };

    hideMenu = () => {
        this._menu.hide();
    };

    showMenu = () => {
        this._menu.show();
    };

    faq = () => {
        this.hideMenu();
        Communications.web("https://connectsby.com/faq.html");
    };

    howTo = () => {
        this.hideMenu();
        Communications.web("https://connectsby.com/how-to.html");
    };
    contactUs = () => {
        this.hideMenu();
        Communications.web("https://connectsby.com/#contact");
    };

    tAndP = () => {
        this.hideMenu();
        Communications.web("https://connectsby.com/privacy-policy.html");
    };
    return (
        <View style={styles.header}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{props.title}</Text>
            </View>
            <View style={styles.menu}>
                <Menu
                    ref={this.setMenuRef}
                    button={
                        <TouchableOpacity style={styles.menuButton} onPress={() => this.showMenu()} >
                            <MaterialCommunityIcons size={30} style={{ color: '#fff' }} name={'menu'} />
                        </TouchableOpacity>
                    }
                >
                    <MenuItem onPress={this.faq}>
                        <View style={styles.menuItem}>
                            <View style={styles.menuItemIcon}>
                                <MaterialCommunityIcons size={20} style={{ color: 'grey' }} name={'comment-question-outline'} />
                            </View>
                            <Text style={styles.menuItemText}>FAQ</Text>
                        </View>
                    </MenuItem>
                    <MenuItem onPress={this.howTo}>
                        <View style={styles.menuItem}>
                            <View style={styles.menuItemIcon}>
                                <MaterialCommunityIcons size={20} style={{ color: 'grey' }} name={'help-circle-outline'} />
                            </View>
                            <Text style={styles.menuItemText}>How To</Text>
                        </View>
                    </MenuItem>
                    <MenuItem onPress={this.contactUs}>
                        <View style={styles.menuItem}>
                            <View style={styles.menuItemIcon}>
                                <MaterialCommunityIcons size={20} style={{ color: 'grey' }} name={'headset'} />
                            </View>
                            <Text style={styles.menuItemText}>Contact us</Text>
                        </View>
                    </MenuItem>
                    <MenuItem onPress={this.tAndP}>
                        <View style={styles.menuItem}>
                            <View style={styles.menuItemIcon}>
                                <MaterialCommunityIcons size={20} style={{ color: 'grey' }} name={'file'} />
                            </View>
                            <Text style={styles.menuItemText}>Terms and Privacy Policy</Text>
                        </View>
                    </MenuItem>
                </Menu>
            </View>
        </View>

    );
};

const styles = StyleSheet.create({
    header: {
        width: '100%',
        height: 70,
        paddingTop: 10,
        backgroundColor: '#3399ff',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: "row"
    },
    titleContainer: {
        flex: 8,
        justifyContent: "center",
        paddingLeft: 30,
        //alignItems: "center"
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        justifyContent: "center",
        alignItems: "center"
    },
    menu: {
        flex: 2,
        justifyContent: "center",
        alignItems: "center"
    },
    menuItem: {
        flexDirection: "row"
    },
    menuItemIcon: {
        flex: 2
    },
    menuItemText: {
        flex: 8,
        paddingLeft: 5,
        fontSize:14
    },

})

export default Header;