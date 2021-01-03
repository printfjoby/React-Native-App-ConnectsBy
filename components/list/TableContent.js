import React, { Component } from 'react';
import {
  StyleSheet, SafeAreaView, FlatList, View, Text, Button, TouchableOpacity, ActivityIndicator,
  Alert, BackHandler, Platform, PermissionsAndroid, TextInput
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Menu, { MenuItem } from 'react-native-material-menu';
import { Banner, Dialog, Portal, Provider, FAB } from 'react-native-paper';
import { HeaderBackButton } from '@react-navigation/stack';
import Share from "react-native-share";
var RNFS = require('react-native-fs');
import Database from '../backend/Database';

const db = new Database();

const Item = ({ name, phone, time, multiSelectMode, onPress, handleLongPress, style }) => (
  <TouchableOpacity
    onPress={multiSelectMode ? handleLongPress : onPress}
    onLongPress={handleLongPress}
    style={[styles.item, style]}>
    <View style={styles.avatarContainer}>
      <View style={styles.avatar}>
        <MaterialCommunityIcons color={"#fff"} size={30} name={'account'} />
      </View>
    </View>
    <View style={styles.detailsContainer}>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <View style={styles.phoneAndTime}>
        <Text style={styles.phone} numberOfLines={1}>{phone}</Text>
        <Text style={styles.time} numberOfLines={1}>{time}</Text>
      </View>
    </View>
    <View style={styles.listIcon}>
      <MaterialCommunityIcons color={"grey"} size={16} name={'greater-than'} />
    </View>
  </TouchableOpacity>
);

export default class TableContent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      peopleList: [],
      searchText: "",
      filteredPeopleList: [],
      noSearchResult: false,
      searchBoxExpanded: true,
      tableName: this.props.route.params.tableName,
      itemSelected: false,
      bannerVisible: true,
      isRenameDialogVisible: false,
      renameValue: 'people',
      selectedIds: [],
      isLoading: true
    };
  }

  componentDidMount() {
    this.focusListner = this.props.navigation.addListener("focus", () => {
      this.getPeople();
    })
  }

  componentWillUnmount() {
    if (this.state.itemSelected || this.state.searchBoxExpanded) {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }
  }

  //clear search box 
  clearSearch = () => {
    this.setState({
      searchText: "",
      noSearchResult: false,
      filteredPeopleList: []
    });
    this.expandSearchBox();
  }
  //expand search box 
  expandSearchBox = () => {
    if (!this.state.searchBoxExpanded) {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
      this.setState({ searchBoxExpanded: true })
    }
    this.props.navigation.setOptions({
      headerLeft: () => {
        null
      },
      headerTitle: () => {
        return (
          <View style={styles.searchBox}>
            <TouchableOpacity style={styles.searchClose} onPress={() => this.getPeople()} >
              <MaterialCommunityIcons size={25} style={{ color: 'grey' }} name={'keyboard-backspace'} />
            </TouchableOpacity>
            <TextInput
              style={styles.searchArea}
              autoFocus={true}
              autoCapitalize={'words'}
              placeholder="Search Name / Phone"
              value={this.state.searchText}
              onChangeText={(value) => this.search(value)}
            />
            <TouchableOpacity style={styles.searchButton} onPress={() => this.clearSearch()} >
              <MaterialCommunityIcons size={22} style={{ color: 'grey' }} name={'close'} />
            </TouchableOpacity>
          </View>
        )
      }
    })
  }

  //initializes state variables
  getPeople() {
    db.listPeople(this.state.tableName).then((data) => {
      this.setState({
        peopleList: data,
        searchText: "",
        searchBoxExpanded: false,
        filteredPeopleList: [],
        noSearchResult: false,
        itemSelected: false,
        renameValue: this.state.tableName,
        selectedIds: [],
        isLoading: false
      });
      this.props.navigation.setOptions({
        headerLeft:
          () => {
            return (<HeaderBackButton tintColor={"#fff"} onPress={() => { this.props.navigation.navigate('TableList') }} />)
          }
        ,
        headerTitle: () => {
          return (
            <View style={styles.headingContainer}>
              <Text style={styles.heading} >{this.state.tableName}</Text>
              <TouchableOpacity style={styles.searchButton} onPress={this.expandSearchBox} >
                <MaterialCommunityIcons size={30} style={{ color: '#fff' }} name={'account-search'} />
              </TouchableOpacity>
            </View>
          )
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
              <MenuItem onPress={this.exportTable}>Export</MenuItem>
              <MenuItem onPress={this.shareList}>Share</MenuItem>
            </Menu>
          </View>
        )
      })
    }).catch((err) => {
      console.log(err);
      this.setState({ isLoading: false });
      Alert.alert('Something Went Wrong', 'Please try again', [{ text: 'Ok', style: 'default' }]);
    })
  }

  search = (searchText) => {
    this.setState({ searchText: searchText });
    this.expandSearchBox();
    let text = searchText.toLowerCase();
    let filteredPeopleList = [];
    filteredPeopleList = this.state.peopleList.filter(function (item) {
      return item.name.toLowerCase().match(text) || item.phone.toLowerCase().match(text);
    });
    console.log(filteredPeopleList)
    if (!text || text === '') {
      this.setState({
        noSearchResult: false,
        filteredPeopleList: []
      })
    } else if (filteredPeopleList.length === 0) {
      this.setState({
        noSearchResult: true,
        filteredPeopleList: []
      })
    } else if (filteredPeopleList.length > 0) {
      this.setState({
        noSearchResult: false,
        filteredPeopleList: filteredPeopleList
      })
    }
  };

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

  //Select all people
  selectAll = () => {
    this.hideMenu();
    allIds = [];
    if (this.state.filteredPeopleList.length) {
      let filteredPeopleList = this.state.filteredPeopleList;
      for (i = 0; i < filteredPeopleList.length; i++) {
        allIds[i] = filteredPeopleList[i]["index_no"];
      }
    } else if (this.state.noSearchResult) {
      allIds = [];
    } else {
      let peopleList = this.state.peopleList;
      for (i = 0; i < peopleList.length; i++) {
        allIds[i] = peopleList[i]["index_no"];
      }
    }

    this.setState({
      selectedIds: allIds
    });
    this.selectionHeader(allIds.length);
  }
  //To clear multi selection 
  handleBackButton = () => {
    if (this.state.itemSelected || this.state.searchBoxExpanded) {
      this.getPeople()
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
      this.getPeople();
    }
  }

  //delete
  delete() {
    this.setState({
      isLoading: true
    });
    db.deleteManyPerson(this.state.tableName, this.state.selectedIds).then((result) => {
      Alert.alert('Success', 'Deleted Successfully', [{ text: 'Ok', onPress: () => this.getPeople(), style: 'default' }]);
    }).catch((err) => {
      console.log(err);
      this.setState({ isLoading: false })
      Alert.alert('Something Went Wrong', 'Please try again', [{ text: 'Ok', style: 'default' }]);
    })
  }

  deleteItems = () => {
    this.hideMenu();
    return (
      Alert.alert('Are you Sure?', 'Delete ' + this.state.selectedIds.length + ' people',
        [{ text: 'Delete', onPress: () => this.delete(), style: 'destructive' }, { text: 'Cancel', style: 'cancel' }])
    )
  }
  //Table to CSV Convertion
  createCsv = (rows) => {
    let csvFile = 'Name,Contact,Date,Time,\n';
    for (var i = 0; i < rows.length; i++) {
      let finalVal = '';
      let j = 0;
      for (x in rows[i]) {
        if ((x === 'sl_no') || (x === 'index_no')) {
          continue;
        }
        let row = rows[i][x];
        let innerValue = row === null ? '' : row.toString();
        let result = innerValue.replace(/"/g, '""');
        if (result.search(/("|,|\n)/g) >= 0)
          result = '"' + result + '"';

        if (x === 'phone') {
          result = " " + result;// Adding space in the front to avoid convertion of '+' to '=' in the csv
        }
        else if (x === 'time') {
          result = result.split(" ");
          result = result[0] + "," + result[1]
        };
        if (j > 0)
          finalVal += ',';
        finalVal += result;
        j++;

      }
      csvFile += finalVal + '\n';
    }
    //console.log(csvFile)
    return csvFile;

  }

  //Writing CSV
  fileWrite(filePath) {
    let csvFile = this.createCsv(this.state.peopleList);
    RNFS.writeFile(filePath, csvFile)
      .then((success) => {
        Alert.alert('Success', 'List Exported', [
          { text: 'View Exports', onPress: () => this.props.navigation.navigate('ExportsList'), style: 'default' },
          { text: 'Ok', onPress: () => this.getPeople(), style: 'default' }
        ]);
        this.setState({ isLoading: false })
      })
      .catch((err) => {
        console.log(err);
        this.setState({ isLoading: false })
        Alert.alert('File Write Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
      });
  }

  handleRenameChange = (value) => {
    this.setState({
      renameValue: value
    });
  }
  setIsRenameDialogVisible = (value) => {
    this.setState({
      isRenameDialogVisible: value
    });
  }

  exportPreProcessing = (path, listName) => {
    let MkdirOptions = {
      NSURLIsExcludedFromBackupKey: true // iOS only
    };

    RNFS.mkdir(path, MkdirOptions)
      .then((success) => {
        let filePath = path + '/' + listName + '.csv';
        RNFS.exists(filePath)
          .then((res) => {
            if (res) {
              this.setState({
                isLoading: false,
                isRenameDialogVisible: true
              })
            }
            else {
              this.fileWrite(filePath)
            }
          })
          .catch((err) => {
            console.log(err)
            this.setState({ isLoading: false })
            Alert.alert('File Check Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
          });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ isLoading: false })
        Alert.alert('Directory Check Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
      });
  }
  //Exporting CSV to exports folder
  exportCsv = (listName) => {
    this.setState({ isLoading: true });
    try {
      if (Platform.OS === 'ios') {
        let path = RNFS.DocumentDirectoryPath;;//iOS only
        console.log(path)
        this.exportPreProcessing(path, listName);
      } else if (Platform.OS === 'android') {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'File Access Permission',
            message: 'This app will write to your file',
            'buttonPositive': 'Allow'
          }
        ).then(() => {
          let path = RNFS.ExternalStorageDirectoryPath + '/ConnectsBy/Exports';
          this.exportPreProcessing(path, listName);
        })
      }
    } catch (err) {
      console.log(err);
      this.setState({ isLoading: false })
      Alert.alert('Export Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
    }
  }

  exportTable = () => {
    this.hideMenu();
    return (
      Alert.alert('Export List', 'Do you want to export ' + this.state.tableName + ' list',
        [{ text: 'Export', onPress: () => this.exportCsv(this.state.tableName), style: 'default' }, { text: 'Cancel', style: 'cancel' }])
    )
  }

  //share
  shareTempExport = (path, listName) => {
    let filePath = path + '/' + listName + '.csv';
    let MkdirOptions = {
      NSURLIsExcludedFromBackupKey: true // iOS only
    };
    RNFS.mkdir(path, MkdirOptions)
      .then(() => {
        console.log(filePath)
        let csvFile = this.createCsv(this.state.peopleList);
        RNFS.writeFile(filePath, csvFile)
          .then((success) => {
            Share.open({
              url: "file://" + filePath
            })
              .then((res) => {
                console.log(res);
                this.setState({ isLoading: false })
              })
              .catch((err) => {
                console.log(err);
                this.setState({ isLoading: false })
              });
          })
          .catch((err) => {
            console.log(err);
            this.setState({ isLoading: false })
            Alert.alert('File Write Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
          });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ isLoading: false })
        Alert.alert('Directory Check Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
      });
  }

  shareListSetPath = (listName) => {
    this.setState({ isLoading: true });
    try {
      if (Platform.OS === 'ios') {
        let path = RNFS.CachesDirectoryPath + '/temp';//iOS only
        console.log(path)
        RNFS.exists(path)
          .then((exists) => {
            if (exists) {
              RNFS.unlink(path) //delete temp directory to erase previous temp export
                .then(() => {
                  this.shareTempExport(path, listName);
                })
                .catch((err) => {
                  console.log(err);
                  this.setState({ isLoading: false })
                  Alert.alert('Share Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
                });
            } else {
              this.shareTempExport(path, listName);
            }
          })
          .catch((err) => {
            console.log(err);
            this.setState({ isLoading: false })
            Alert.alert('Share Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
          });
      } else if (Platform.OS === 'android') {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'File Access Permission',
            message: 'This app will write to your file',
            'buttonPositive': 'Allow'
          }
        ).then(() => {
          let path = RNFS.CachesDirectoryPath + '/temp';
          RNFS.exists(path)
            .then((exists) => {
              if (exists) {
                RNFS.unlink(path)
                  .then(() => {
                    this.shareTempExport(path, listName);
                  })
                  .catch((err) => {
                    console.log(err);
                    this.setState({ isLoading: false })
                    Alert.alert('Share Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
                  });
              } else {
                this.shareTempExport(path, listName);
              }
            })
            .catch((err) => {
              console.log(err);
              this.setState({ isLoading: false })
              Alert.alert('Share Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
            });
        })
      }
    } catch (err) {
      console.log(err);
      this.setState({ isLoading: false })
      Alert.alert('Share Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
    }
  }

  shareList = () => {
    this.hideMenu();
    return (
      Alert.alert('Share List', 'Do you want to share ' + this.state.tableName + ' list',
        [{ text: 'Share', onPress: () => this.shareListSetPath(this.state.tableName), style: 'default' }, { text: 'Cancel', style: 'cancel' }])
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
            <TouchableOpacity onPress={() => this.getPeople()} >
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

    //Dialog box with Text Input for renaming 
    if (this.state.isRenameDialogVisible) {
      return (
        <Provider>
          <Portal>
            <Dialog style={{ paddingBottom: 20 }}
              visible={this.state.isRenameDialogVisible}
            // onDismiss={() => {this.setIsRenameDialogVisible(false); this.getPeople()}}
            >
              <Dialog.Title>File name already exists. Please Rename </Dialog.Title>
              <Dialog.Content>
                <TextInput
                  value={this.state.renameValue}
                  autoFocus={true}
                  onChangeText={this.handleRenameChange}
                />
              </Dialog.Content>
              <Dialog.Actions style={{ justifyContent: "space-evenly" }}>
                <Button onPress={() => this.setIsRenameDialogVisible(false)} title={"Cancel"} />
                <Button onPress={() => { this.setIsRenameDialogVisible(false); this.exportCsv(this.state.renameValue) }} title={"Export"} />
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </Provider>
      )
    }
    //Message to display when table is empty
    if (this.state.peopleList.length == 0) {
      return (
        <>
          <Banner
            visible={this.state.bannerVisible}
            style={{ justifyContent: "center" }}
            actions={[
              {
                label: 'Got it',
                onPress: () => this.setState({ bannerVisible: false }),
              },
            ]}
            icon={() => (<View ><MaterialCommunityIcons size={50} name={'bell-circle-outline'} /></View>)}>
            List is Empty. Please Scan Qr Code
            <MaterialCommunityIcons style={[{ color: "#fff" }]} size={26} name={'keyboard-outline'} /> or Enter Details.
        </Banner>
          <FAB
            style={styles.typeFab}
            icon={() => (<MaterialCommunityIcons style={[{ color: "#fff" }]} size={26} name={'keyboard-outline'} />)}
            onPress={() => this.props.navigation.navigate('ListInsertData', { tableName: this.state.tableName })}
          />
          <FAB
            style={styles.scanFab}
            icon={() => (<MaterialCommunityIcons style={[{ color: "#fff" }]} size={24} name={'qrcode-scan'} />)}
            onPress={() => this.props.navigation.navigate('ListQrScan', { tableName: this.state.tableName })}
          />
        </>
      );
    }

    //creating list item Component
    let renderItem = ({ item }) => {
      //change color of selected items
      let backgroundColor = this.state.selectedIds.includes(item.index_no) ? "#e6e6e6" : "#ffffff";
      //multiSelectMode isused to change the behaviour of onPress action from view mode to select mode
      let multiSelectMode = (this.state.selectedIds && this.state.selectedIds.length) ? true : false;
      let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      let month = item.time.slice(5, 7);
      let day = item.time.slice(8, 10);
      let hour = item.time.slice(11, 13);
      let min = item.time.slice(14, 16);
      let amPm = "AM";
      if (hour >= 12) {
        amPm = "PM"
      }
      if (hour > 12) {
        hour = hour % 12;
        hour = ('0' + hour).slice(-2); // To add zero in front of single digit numbers.
      }
      let time = day + " " + months[month - 1] + " " + hour + ":" + min + " " + amPm;
      return (
        <Item
          name={item.name}
          phone={item.phone}
          time={time}
          multiSelectMode={multiSelectMode}
          onPress={() => this.props.navigation.navigate('ViewPersonInfo',
            {
              tableName: this.state.tableName,
              index_no: item.index_no,
              name: item.name,
              phone: item.phone
            })}
          handleLongPress={() => this.handleMultipleSelection(item.index_no)}

          style={{ backgroundColor }}
        />
      )
    }

    return (
      <SafeAreaView style={styles.container}>
        {
          this.state.noSearchResult ?
            <View style={styles.noResult}>
              <Text style={styles.msg}>No results found</Text>
            </View>
            :
            <FlatList
              data={this.state.filteredPeopleList && this.state.filteredPeopleList.length > 0 ?
                this.state.filteredPeopleList
                :
                this.state.peopleList}
              //data={this.state.peopleList}
              extraData={this.state}
              inverted={false}
              renderItem={renderItem}
              keyExtractor={item => item.index_no.toString()}
            />
        }

        <FAB
          style={styles.typeFab}
          icon={() => (<MaterialCommunityIcons style={[{ color: "#fff" }]} size={26} name={'keyboard-outline'} />)}
          onPress={() => this.props.navigation.navigate('ListInsertData', { tableName: this.state.tableName })}
        />
        <FAB
          style={styles.scanFab}
          icon={() => (<MaterialCommunityIcons style={[{ color: "#fff" }]} size={24} name={'qrcode-scan'} />)}
          onPress={() => this.props.navigation.navigate('ListQrScan', { tableName: this.state.tableName })}
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
  noResult: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff"
  },
  msg: {
    fontSize: 18,
    fontStyle: "italic"
  },
  headingContainer: {
    flexDirection: "row"
  },
  heading: {
    flex: 4,
    fontSize: 20,
    color: '#fff',
    fontWeight: "bold"
  },
  searchBox: {
    backgroundColor: "#fff",
    height: 40,
    flexDirection: "row",
    borderRadius: 10,
    alignItems: "center"
  },
  searchClose: {
    flex: 1,
    paddingLeft: 5
  },
  searchArea: {
    flex: 8,
    fontSize: 16,
  },
  searchButton: {
    flex: 1
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
  avatarContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center"
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    overflow: 'hidden',
    backgroundColor: "#4da6ff"
  },
  detailsContainer: {
    flex: 10,
    flexDirection: "column",
    marginLeft: 20,
    paddingVertical: 5,
  },
  name: {
    flex: 1,
    fontSize: 18,
  },
  phoneAndTime: {
    flex: 1,
    flexDirection: "row"
  },
  phone: {
    flex: 5,
    fontSize: 14
  },
  time: {
    flex: 5,
    fontSize: 14
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
  typeFab: {
    position: 'absolute',
    backgroundColor: '#3399ff',
    margin: 16,
    right: 0,
    bottom: 65,
  },
  scanFab: {
    position: 'absolute',
    backgroundColor: '#3399ff',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  moreButton: {
    marginRight: 20,
  }
});