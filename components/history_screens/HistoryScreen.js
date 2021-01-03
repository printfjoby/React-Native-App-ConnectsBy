import React, { Component } from 'react';
import {
  StyleSheet, SafeAreaView, FlatList, View, Text, TouchableOpacity, ActivityIndicator,
  Alert, BackHandler
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Menu, { MenuItem } from 'react-native-material-menu';
import { Banner } from 'react-native-paper';
import HistoryDatabase from '../backend/HistoryDatabase';

const db = new HistoryDatabase();

const Website = ({ url, time, multiSelectMode, onPress, handleLongPress, style }) =>
  (
    <TouchableOpacity
      onPress={multiSelectMode ? handleLongPress : onPress}
      onLongPress={handleLongPress}
      style={[styles.item, style]}>
      <MaterialCommunityIcons style={styles.leftIcon} size={30} name={'web'} />
      <View style={styles.content}>
        <Text style={styles.type}>Website</Text>
        <Text style={styles.qrData} numberOfLines={1}>{url}</Text>
      </View>
      <View style={styles.listIcon}>
        <MaterialCommunityIcons size={16} name={'greater-than'} />
      </View>
    </TouchableOpacity>
  );

const PhoneNumber = ({ phone, time, multiSelectMode, onPress, handleLongPress, style }) =>
  (
    <TouchableOpacity
      onPress={multiSelectMode ? handleLongPress : onPress}
      onLongPress={handleLongPress}
      style={[styles.item, style]}>
      <MaterialCommunityIcons style={styles.leftIcon} size={30} name={'phone'} />
      <View style={styles.content}>
        <Text style={styles.type}>Phone Number</Text>
        <Text style={styles.qrData} numberOfLines={1}>{phone}</Text>
      </View>
      <View style={styles.listIcon}>
        <MaterialCommunityIcons size={16} name={'greater-than'} />
      </View>
    </TouchableOpacity>
  );

const SMS = ({ phone, time, multiSelectMode, onPress, handleLongPress, style }) =>
  (
    <TouchableOpacity
      onPress={multiSelectMode ? handleLongPress : onPress}
      onLongPress={handleLongPress}
      style={[styles.item, style]}>
      <MaterialCommunityIcons style={styles.leftIcon} size={30} name={'message-text-outline'} />
      <View style={styles.content}>
        <Text style={styles.type}>SMS To</Text>
        <Text style={styles.qrData} numberOfLines={1}>{phone}</Text>
      </View>
      <View style={styles.listIcon}>
        <MaterialCommunityIcons size={16} name={'greater-than'} />
      </View>
    </TouchableOpacity>
  );

const EMail = ({ mailId, time, multiSelectMode, onPress, handleLongPress, style }) =>
  (
    <TouchableOpacity
      onPress={multiSelectMode ? handleLongPress : onPress}
      onLongPress={handleLongPress}
      style={[styles.item, style]}>
      <MaterialCommunityIcons style={styles.leftIcon} size={30} name={'email-outline'} />
      <View style={styles.content}>
        <Text style={styles.type}>E-Mail</Text>
        <Text style={styles.qrData} numberOfLines={1}>{mailId}</Text>
      </View>
      <View style={styles.listIcon}>
        <MaterialCommunityIcons size={16} name={'greater-than'} />
      </View>
    </TouchableOpacity>
  );
const VCard = ({ name, time, multiSelectMode, onPress, handleLongPress, style }) =>
  (
    <TouchableOpacity
      onPress={multiSelectMode ? handleLongPress : onPress}
      onLongPress={handleLongPress}
      style={[styles.item, style]}>
      <MaterialCommunityIcons style={styles.leftIcon} size={30} name={'account'} />
      <View style={styles.content}>
        <Text style={styles.type}>Contact</Text>
        <Text style={styles.qrData} numberOfLines={1}>{name}</Text>
      </View>
      <View style={styles.listIcon}>
        <MaterialCommunityIcons size={16} name={'greater-than'} />
      </View>
    </TouchableOpacity>
  );
const TextData = ({ text, time, multiSelectMode, onPress, handleLongPress, style }) =>
  (
    <TouchableOpacity
      onPress={multiSelectMode ? handleLongPress : onPress}
      onLongPress={handleLongPress}
      style={[styles.item, style]}>
      <MaterialCommunityIcons style={styles.leftIcon} size={30} name={'format-text'} />
      <View style={styles.content}>
        <Text style={styles.type}>Text</Text>
        <Text style={styles.qrData} numberOfLines={1}>{text}</Text>
      </View>
      <View style={styles.listIcon}>
        <MaterialCommunityIcons size={16} name={'greater-than'} />
      </View>
    </TouchableOpacity>
  );
export default class HistoryScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      historyList: [],
      itemSelected: false,
      bannerVisible: true,
      selectedIds: [],
      isFetching: false
    };
  }

  componentDidMount() {
    this.focusListner = this.props.navigation.addListener("focus", () => {
      this.getHistoryItems();
    })
  }

  componentWillUnmount() {
    if (this.state.itemSelected) {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }
  }

  //initializes state variables
  getHistoryItems() {
    db.getHistory().then((data) => {
      this.setState({
        historyList: data,
        itemSelected: false,
        selectedIds: [],
        isFetching: false,
        isLoading: false
      });
      this.props.navigation.setOptions({
        headerTitle: () => { return (<Text style={styles.heading} >History</Text>) },
        headerRight: () => (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Menu
              ref={this.setMenuRef}
              button={
                <TouchableOpacity style={styles.moreButton} onPress={this.showMenu} >
                  <MaterialCommunityIcons size={30} style={{ color: '#fff' }} name={'dots-vertical'} />
                </TouchableOpacity>
              }
            >
              <MenuItem onPress={this.selectAll}>Select All</MenuItem>
            </Menu>
          </View>
        )
      })
    }).catch((err) => {
      console.log(err);
    })
  }

  //refresh history table on pull
  onRefresh() {
    this.setState({ isFetching: true }, () => {
      this.getHistoryItems();
    });
  }

  // more option menu functions
  _menu = null;

  setMenuRef = ref => {
    this._menu = ref;
  };

  hideMenu = () => {
    this._menu.hide();
  };

  showMenu = () => {
    this._menu.show();
  };

  //Select all histories
  selectAll = () => {
    this.hideMenu();
    allIds = [];
    let historyList = this.state.historyList;
    for (i = 0; i < historyList.length; i++) {
      allIds[i] = historyList[i]["index_no"];
    }
    this.setState({
      selectedIds: allIds
    });
    this.selectionHeader(allIds.length);
  }
  //To clear multi selection 
  handleBackButton = () => {
    if (this.state.itemSelected) {
      this.getHistoryItems()
      return true;
    } else {
      return false;
    }
  };
  //adding selected item ids to an state variable array 
  handleMultipleSelection = (id) => {
    if (!this.state.itemSelected) {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
      this.setState({ itemSelected: true })
    }
    var selectedIds = [...this.state.selectedIds]
    if (selectedIds.includes(id))
      selectedIds = selectedIds.filter(_id => _id !== id)
    else
      selectedIds.push(id)
    this.setState({ selectedIds })
    if (selectedIds.length > 0) {
      this.selectionHeader(selectedIds.length);
    } else if (selectedIds.length === 0) {
      this.getHistoryItems();
    }
  }

  //delete
  delete() {
    this.setState({
      isLoading: true
    });
    db.deleteFromHistory(this.state.selectedIds).then((result) => {
      Alert.alert('Success', 'Deleted Successfully', [{ text: 'Ok', onPress: () => this.getHistoryItems(), style: 'default' }]);
    }).catch((err) => {
      console.log(err);
      this.setState({ isLoading: false })
      Alert.alert('Something Went Wrong', 'Please try again', [{ text: 'Ok', style: 'default' }]);
    })
  }

  deleteItems = () => {
    this.hideMenu();
    return (
      Alert.alert('Are you Sure?', 'Delete ' + this.state.selectedIds.length + ' History',
        [{ text: 'Delete', onPress: () => this.delete(), style: 'destructive' }, { text: 'Cancel', style: 'cancel' }])
    )
  }

  //Changing header and showing select status and options on selecting items
  selectionHeader(noOfSelection) {
    let selectedTitle = 'Selected ' + noOfSelection + ' items';
    this.props.navigation.setOptions({
      headerTitle: () => {
        return (
          <View style={styles.selectionHeader}>
            <Text style={styles.heading}>{selectedTitle}</Text>
            <TouchableOpacity onPress={() => this.getHistoryItems()} >
              <MaterialCommunityIcons size={25} style={{ color: '#fff' }} name={'close'} />
            </TouchableOpacity>
          </View>)
      },
      headerRight: () => (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Menu
            ref={this.setMenuRef}
            button={
              <TouchableOpacity style={styles.moreButton} onPress={this.showMenu} >
                <MaterialCommunityIcons size={30} style={{ color: '#fff' }} name={'dots-vertical'} />
              </TouchableOpacity>
            }
          >
            <MenuItem onPress={this.selectAll}>Select All</MenuItem>
            <MenuItem onPress={this.deleteItems}>Delete</MenuItem>
          </Menu>
        </View>
      )
    });
  }

  render() {
    //Show loading
    if (this.state.isLoading) {
      return (
        <View style={styles.activity}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )
    }

    //Message to display when History is empty
    if (this.state.historyList.length === 0) {
      return (
        <Banner
          visible={this.state.bannerVisible}
          style={{ justifyContent: "center" }}
          actions={[
            {
              label: 'Reload',
              onPress: () => { this.onRefresh() },
            },
          ]}
          icon={() => (<View ><MaterialCommunityIcons size={50} name={'bell-circle-outline'} /></View>)}>
          No History to display. You haven't scanned anything yet!
        </Banner>
      );
    }

    //creating list item Component
    let renderItem = ({ item }) => {
      //change color of selected items
      let backgroundColor = this.state.selectedIds.includes(item.index_no) ? "#e6e6e6" : "#ffffff";
      //multiSelectMode isused to change the behaviour of onPress action from view mode to select mode
      let multiSelectMode = (this.state.selectedIds && this.state.selectedIds.length) ? true : false;
      try {
        let qrType = item.qr_type;
        let qrData = item.qr_data;
        if (qrType === 1) {
          let name = "";
          let infoArray = qrData.split("\n");
          for (i = 0; i < infoArray.length; i++) {
            if (infoArray[i].startsWith("FN:")) {
              let fn = infoArray[i].match(new RegExp("FN:(.*)"));
              if (fn[1] != '') {
                name = fn[1];
              }
              break;
            } else if (infoArray[i].startsWith("N:")) {
              if (infoArray[i].includes(";")) {
                let firstName = infoArray[i].match(new RegExp(";(.*?)(;|$)"));
                let lastName = infoArray[i].match(new RegExp("N:(.*?);"));
                if (lastName[1]) {
                  name = firstName[1].concat(" ".concat(lastName[1]));
                } else {
                  name = firstName[1]
                }
              } else {
                name = infoArray[i].match(new RegExp("N:(.*)"));
                name = name[1];
              }
            }

          }
          if (name === "") {
            for (i = 0; i < infoArray.length; i++) {
              if (infoArray[i].startsWith("ORG:")) {
                let org = infoArray[i].match(new RegExp("ORG:(.*)"));
                name = org[1];
                break;
              }
            }
          }
          return (
            <VCard
              name={name}
              time={item.time}
              multiSelectMode={multiSelectMode}
              onPress={() => this.props.navigation.navigate('VcardAction',
                {
                  qrData: qrData
                })
              }
              handleLongPress={() => this.handleMultipleSelection(item.index_no)}
              style={{ backgroundColor }}
            />
          )
        } else if (qrType === 2) {
          return (
            <Website
              url={qrData}
              time={item.time}
              multiSelectMode={multiSelectMode}
              onPress={() => {
                this.props.navigation.navigate('WebpageAction',
                  {
                    URL: qrData
                  })
              }}
              handleLongPress={() => this.handleMultipleSelection(item.index_no)}
              style={{ backgroundColor }}
            />
          )
        } else if (qrType === 3) {
          return (
            <PhoneNumber
              phone={qrData}
              time={item.time}
              multiSelectMode={multiSelectMode}
              onPress={() => {
                this.props.navigation.navigate('PhoneNumberAction',
                  {
                    phoneNumber: qrData
                  })
              }}
              handleLongPress={() => this.handleMultipleSelection(item.index_no)}
              style={{ backgroundColor }}
            />
          )
        } else if (qrType === 4) {
          let qrDataSplit = qrData.split(":");
          let phoneNumber = qrDataSplit[1];
          let msgBody = qrDataSplit[2];
          return (
            <SMS
              phone={phoneNumber}
              time={item.time}
              multiSelectMode={multiSelectMode}
              onPress={() => this.props.navigation.navigate('SmsAction',
                {
                  phoneNumber: phoneNumber,
                  msgBody: msgBody
                })
              }
              handleLongPress={() => this.handleMultipleSelection(item.index_no)}
              style={{ backgroundColor }}
            />
          )
        } else if (qrType === 5) {
          let mailId, subject, body;
          if (qrData.startsWith('mailto:')) {
            mailId = qrData.match(new RegExp("mailto:(.*)\\?subject="));
            mailId = mailId[1];
            subject = qrData.match(new RegExp("\\?subject=(.*)&body="));
            subject = subject[1];
            body = qrData.match(new RegExp("&body=(.*)"));
            body = body[1];
          } else if (qrData.startsWith('MATMSG:TO:')) {
            mailId = qrData.match("MATMSG:TO:(.*);SUB:");
            mailId = mailId[1];
            subject = qrData.match(";SUB:(.*);BODY:");
            subject = subject[1];
            body = qrData.match(";BODY:(.*);;");
            body = body[1];
          }
          return (
            <EMail
              mailId={mailId}
              time={item.time}
              multiSelectMode={multiSelectMode}
              onPress={() => {
                this.props.navigation.navigate('EmailAction',
                  {
                    mailId: mailId,
                    subject: subject,
                    body: body
                  })
              }}
              handleLongPress={() => this.handleMultipleSelection(item.index_no)}
              style={{ backgroundColor }}
            />
          )
        } else if (qrType === 6) {
          return (
            <TextData
              text={qrData}
              time={item.time}
              multiSelectMode={multiSelectMode}
              onPress={() => {
                this.props.navigation.navigate('TextAction',
                  {
                    qrData: qrData
                  })
              }}
              handleLongPress={() => this.handleMultipleSelection(item.index_no)}
              style={{ backgroundColor }}
            />
          )
        }
      } catch (error) {
        console.log(error)
      }
    }

    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={this.state.historyList}
          onRefresh={() => this.onRefresh()}
          refreshing={this.state.isFetching}
          extraData={this.state}
          inverted={false}
          renderItem={renderItem}
          keyExtractor={item => item.index_no.toString()}
        />
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1
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
  item: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingLeft: 10,
    paddingVertical: 5,
    marginVertical: 1,
    marginHorizontal: 1,
    alignItems: "center"
  },
  leftIcon: {
    flex: 2,
    textAlign: "right"
  },
  content: {
    flex: 10,
    flexDirection: "column",
    marginLeft: 20,
    paddingVertical: 14,
  },
  type: {
    fontSize: 16,
    fontWeight: "bold"
  },
  qrData: {
    fontSize: 16,
  },
  listIcon: {
    flex: 1,
    marginRight: 20
  },
  selectionHeader: {
    flexDirection: 'row',
    color: '#fff',
    alignItems: "center",
    justifyContent: "space-around"
  },
  heading: {
    fontSize: 20,
    textAlign: "center",
    color: '#fff',
    fontWeight: "bold"
  },
  moreButton: {
    marginRight: 20,
  }
});
