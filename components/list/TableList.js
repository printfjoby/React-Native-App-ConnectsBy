import React, { Component } from 'react';
import {
  StyleSheet, SafeAreaView, FlatList, View, Text, Button, TouchableOpacity, ActivityIndicator,
  Alert, BackHandler, Platform, PermissionsAndroid, TextInput
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Menu, { MenuItem } from 'react-native-material-menu';
import { Banner, Dialog, Portal, Provider, FAB } from 'react-native-paper';
import Share from "react-native-share";
var RNFS = require('react-native-fs');
import Database from '../backend/Database';

const db = new Database();

const Item = ({ title, multiSelectMode, onPress, handleLongPress, style }) => (
  <TouchableOpacity
    onPress={multiSelectMode ? handleLongPress : onPress}
    onLongPress={handleLongPress}
    style={[styles.item, style]}>

    <MaterialCommunityIcons style={styles.leftIcon} size={26} name={'format-list-bulleted'} />
    <Text style={styles.name} numberOfLines={1}>{title}</Text>
    <View style={styles.listIcon}>
      <MaterialCommunityIcons size={16} name={'greater-than'} />
    </View>
  </TouchableOpacity>
);

export default class TableContent extends Component {
  constructor(props) {
    super(props);

    //this.handleMultipleSelection = this.handleMultipleSelection.bind(this);
    this.state = {
      tablesList: [],
      itemSelected: false,
      bannerVisible: true,
      dialogMode: '',
      nameDialogVisible: false,
      dialogBoxTitle: '',
      nameValue: '',
      selectedIds: [],
      isLoading: false
    };
  }

  componentDidMount() {
    this.focusListner = this.props.navigation.addListener("focus", () => {
      this.getTables();
    })
  }

  componentWillUnmount() {
    if (this.state.itemSelected) {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }
    /// if(this.focusListner){
    // this.focusListner.remove();
    //}
  }

  //initializes state variables
  getTables() {
    db.listTables().then((data) => {
      this.setState({
        tablesList: data,
        itemSelected: false,
        selectedIds: [],
        isLoading: false
      });
      this.props.navigation.setOptions({
        headerTitle: () => {
          return (
            <View style={styles.headerContainer}>
              <Text style={styles.heading} >Lists</Text>
              <TouchableOpacity style={styles.exportButton} onPress={() => this.props.navigation.navigate('ExportsList')} >
                <View style={styles.exportButtonContainer}>
                  <MaterialCommunityIcons style={styles.exportIcon} size={20} name={'export-variant'} />
                  <Text style={styles.exportText}>Exports</Text>
                </View>
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

  //Select all tables
  selectAll = () => {
    this.hideMenu();
    allIds = [];
    let tablesList = this.state.tablesList;
    for (i = 0; i < tablesList.length; i++) {
      allIds[i] = tablesList[i]["index_no"];
    }
    this.setState({
      selectedIds: allIds
    });
    this.selectionHeader(allIds.length);
  }
  //To clear multi selection 
  handleBackButton = () => {
    if (this.state.itemSelected) {
      this.getTables()
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
      this.getTables();
    }
  }

  //delete
  delete() {
    this.setState({
      isLoading: true
    });
    let selectedIds = this.state.selectedIds;
    let tablesList = this.state.tablesList;
    let tablesToDelete = [];
    for (let i = 0; i < selectedIds.length; i++) {
      for (let j = 0; j < tablesList.length; j++) {
        if (selectedIds[i] == tablesList[j].index_no) {
          let tableName = tablesList[j].tableName;
          tablesToDelete.push({
            tableName
          });
        }
      }
    }

    db.deleteTable(tablesToDelete).then((result) => {
      Alert.alert('Success', 'Deleted Successfully', [{ text: 'Ok', onPress: () => this.getTables(), style: 'default' }]);
    }).catch((err) => {
      console.log(err);
      this.setState({ isLoading: false })
      Alert.alert('Something Went Wrong', 'Please try again', [{ text: 'Ok', style: 'default' }]);
    })
  }

  deleteItems = () => {
    this.hideMenu();
    return (
      Alert.alert('Are you Sure?', 'Delete ' + this.state.selectedIds.length + ' Lists',
        [{ text: 'Delete', onPress: () => this.delete(), style: 'destructive' }, { text: 'Cancel', style: 'cancel' }])
    )
  }

  //Handle name change in dialog box while Creating New List, Ranaming List and Renaming Export File
  handleNameChange = (value) => {
    this.setState({
      nameValue: value
    });
  }
  //Show or hide name input dialog box while Creating New List, Ranaming List and Renaming Export File
  setNameDialogVisible = (value) => {
    this.setState({
      nameDialogVisible: value
    });
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
          result = " " + result;// To avoid convertion of '+' to '=' in the csv
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
    return csvFile;

  }

  //Writing CSV
  fileWrite(filePath, listName) {
    let tablesList = this.state.tablesList;
    let oldListName;// If export name different from list name
    tablesList.map((item) => {
      if (item.index_no === this.state.selectedIds[0]) {
        oldListName = item.tableName;
      }
    })
    db.listPeople(oldListName).then((data) => {
      let csvFile = this.createCsv(data);
      RNFS.writeFile(filePath, csvFile)
        .then((success) => {
          Alert.alert('Success', 'List Exported', [
            { text: 'View Exports', onPress: () => this.props.navigation.navigate('ExportsList'), style: 'default' },
            { text: 'Ok', onPress: () => this.getTables(), style: 'default' }
          ]);
          this.setState({ isLoading: false })
        })
        .catch((err) => {
          console.log(err);
          this.setState({ isLoading: false })
          Alert.alert('File Write Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
        });
    }).catch((err) => {
      console.log(err);
      this.setState({ isLoading: false })
      Alert.alert('Data Fetching Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
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
                dialogMode: 'Export_Name',
                dialogBoxTitle: 'File already Exists. Please try another name',
                nameValue: listName
              })
              this.setNameDialogVisible(true)
            }
            else {
              this.fileWrite(filePath, listName)
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
  exportCsv = () => {
    let listName = this.state.nameValue;
    this.setState({ isLoading: true });
    try {
      if (Platform.OS === 'ios') {
        let path = RNFS.DocumentDirectoryPath;
        //console.log("Path:" + path)
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

  //share
  shareTempExport = (path, listName, listData) => {
    return new Promise((resolve) => {
      let filePath = path + '/' + listName + '.csv';
      let MkdirOptions = {
        NSURLIsExcludedFromBackupKey: true // iOS only
      };
      RNFS.mkdir(path, MkdirOptions)
        .then(() => {
          console.log(filePath)
          let csvFile = this.createCsv(listData);
          RNFS.writeFile(filePath, csvFile)
            .then(() => {
              resolve(filePath);
            })
            .catch((err) => {
              console.log(err);
              resolve(false);
            });
        })
        .catch((err) => {
          console.log(err);
          resolve(false);
        });
    })
  }

  shareListFile = (path) => {
    let selectedIds = this.state.selectedIds;
    let tablesList = this.state.tablesList;
    let selectedTablesName = [];
    tablesList.map((item) => {
      if (selectedIds.includes(item.index_no)) {
        selectedTablesName.push(item.tableName);
      }
    })
    let promises = [];
    db.getManyTableData(selectedTablesName).then((data) => {
      data.forEach((item) => {
        promises.push(this.shareTempExport(path, item.tableName, item.tableData));
      })
      Promise.all(promises)
        .then((results) => {
          let files = [];
          results.forEach((result) => {
            if (result) {
              let filePath = "file://" + result;
              files.push(filePath);
            }
          })
          Share.open({
            urls: files
          })
            .then((res) => {
              console.log(res)
              this.getTables()
              this.setState({ isLoading: false })
            })
            .catch((err) => {
              console.log(err);
              this.setState({ isLoading: false })
            });
        })
        .catch((e) => {
          console.log(e)
          Alert.alert('Failed', 'Unable to share files', [{ text: 'Ok', style: 'default' }]);
          this.setState({ isLoading: false })
        });
    })
  }

  shareListSetPath = () => {
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
                  this.shareListFile(path);
                })
                .catch((err) => {
                  console.log(err);
                  this.setState({ isLoading: false })
                  Alert.alert('Share Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
                });
            } else {
              this.shareListFile(path);
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
                    this.shareListFile(path);
                  })
                  .catch((err) => {
                    console.log(err);
                    this.setState({ isLoading: false })
                    Alert.alert('Share Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
                  });
              } else {
                this.shareListFile(path);
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
      Alert.alert('Share List', 'Do you want to share ' + this.state.selectedIds.length + ' lists',
        [{ text: 'Share', onPress: () => this.shareListSetPath(), style: 'default' }, { text: 'Cancel', style: 'cancel' }])
    )
  }


  //Rename List
  renameList = () => {
    this.setState({
      isLoading: true
    });
    let tablesList = this.state.tablesList;
    let nameValue = this.state.nameValue;
    let tableAlreadyExists = false;
    tablesList.map((item) => {
      if (item.tableName === nameValue) {
        tableAlreadyExists = true;
      }
    })
    if (tableAlreadyExists) {
      this.setState({
        dialogMode: 'Rename',
        dialogBoxTitle: 'List Name Already Exists. Try Another Name',
        isLoading: false
      });
      this.setNameDialogVisible(true);
    } else {
      let oldListName;
      tablesList.map((item) => {
        if (item.index_no === this.state.selectedIds[0]) {
          oldListName = item.tableName;
        }
      })
      db.renameTable(oldListName, nameValue)
        .then((res) => {
          Alert.alert('Success', 'List  Renamed', [
            { text: 'Ok', onPress: () => this.getTables(), style: 'default' }
          ]);
          this.setState({ isLoading: false })
        })
        .catch((err) => {
          console.log(err);
          this.setState({ isLoading: false })
          Alert.alert('Failed to rename', 'Please try again', [{ text: 'Ok', style: 'default' }]);
        })
    }
  }

  //Add New List
  addNewList() {
    this.setState({
      isLoading: true
    });
    let tablesList = this.state.tablesList;
    let nameValue = this.state.nameValue;
    nameValue = nameValue.replace(/ /g, "_");
    let tableAlreadyExists = false;

    tablesList.map((item) => {
      if (item.tableName === nameValue) {
        tableAlreadyExists = true;
      }
    })
    if (tableAlreadyExists) {

      this.setState({
        dialogMode: 'New_List',
        dialogBoxTitle: 'List Name Already Exists. Try Another Name',
        isLoading: false
      });
      this.setNameDialogVisible(true);
    } else {
      db.addTable(nameValue)
        .then((res) => {
          this.props.navigation.navigate('TableContent',
            {
              tableName: nameValue
            })
        })
        .catch((err) => {
          this.setState({ isLoading: false })
          Alert.alert('Failed to Create New List', 'Please try again or Use another list name', [{ text: 'Ok', style: 'default' }]);
        })
    }
  }

  //Changing header and showing select status and options on selecting items
  selectionHeader(noOfSelection) {
    let selectedTitle = 'Selected ' + noOfSelection + ' items';
    this.props.navigation.setOptions({
      headerTitle: () => {
        return (
          <View style={styles.selectionHeader}>
            <Text style={styles.heading}>{selectedTitle}</Text>
            <TouchableOpacity onPress={() => this.getTables()} >
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
            {this.state.selectedIds.length === 1 ?
              <>
                <MenuItem onPress={this.selectAll}>Select All</MenuItem>
                <MenuItem onPress={this.deleteItems}>Delete</MenuItem>
                <MenuItem onPress={this.shareList}>Share</MenuItem>
                <MenuItem onPress={() => {
                  this.hideMenu();
                  let tablesList = this.state.tablesList;
                  let listName;
                  tablesList.map((item) => {
                    if (item.index_no === this.state.selectedIds[0]) {
                      listName = item.tableName;
                    }
                  });
                  this.setState({
                    dialogMode: 'Export_Name',
                    dialogBoxTitle: 'Export AS',
                    nameValue: listName
                  });
                  this.setNameDialogVisible(true);
                }}
                >Export</MenuItem>
                <MenuItem onPress={() => {
                  this.hideMenu();
                  let tablesList = this.state.tablesList;
                  let oldListName;
                  tablesList.map((item) => {
                    if (item.index_no === this.state.selectedIds[0]) {
                      oldListName = item.tableName;
                    }
                  });
                  this.setState({
                    dialogMode: 'Rename',
                    dialogBoxTitle: 'Enter New Name',
                    nameValue: oldListName
                  });
                  this.setNameDialogVisible(true);
                }}
                >Rename</MenuItem>
              </>
              :
              <>
                <MenuItem onPress={this.selectAll}>Select All</MenuItem>
                <MenuItem onPress={this.deleteItems}>Delete</MenuItem>
                <MenuItem onPress={this.shareList}>Share</MenuItem>
              </>
            }
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

    //Dialog box with Text Input for entering new table name 
    if (this.state.nameDialogVisible) {
      return (
        <Provider>
          <Portal>
            <Dialog style={{ paddingBottom: 20 }}
              visible={this.state.nameDialogVisible}
            // onDismiss={() => {this.setNameDialogVisible(false); this.getTables()}}
            >
              <Dialog.Title>{this.state.dialogBoxTitle} </Dialog.Title>
              <Dialog.Content>
                <TextInput
                  value={this.state.nameValue}
                  autoFocus={true}
                  onChangeText={this.handleNameChange}
                />
              </Dialog.Content>
              <Dialog.Actions style={{ justifyContent: "space-evenly" }}>
                <Button onPress={() => {
                  this.setNameDialogVisible(false);
                  this.setState({ nameValue: '' });
                }}
                  title={"Cancel"} />
                {this.state.dialogMode === 'New_List' ?
                  <Button
                    onPress={() => {
                      this.setNameDialogVisible(false);
                      this.addNewList();
                    }}
                    title={"Create"}
                  />
                  :
                  this.state.dialogMode === 'Rename' ?
                    <Button
                      onPress={() => {
                        this.setNameDialogVisible(false);
                        this.renameList();
                      }}
                      title={"Rename"}
                    />
                    :
                    this.state.dialogMode === 'Export_Name' ?
                      <Button
                        onPress={() => {
                          this.setNameDialogVisible(false);
                          this.exportCsv();
                        }}
                        title={"Export"}
                      />
                      :
                      null
                }
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </Provider>
      )
    }

    //Message to display when table is empty
    if (this.state.tablesList.length === 0) {
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
            Create New List by Clicking on Plus(+) Botton.
        </Banner>
          <FAB
            style={styles.addFab}
            icon={() => (<MaterialCommunityIcons style={[{ color: "#fff" }]} size={26} name={'plus'} />)}
            onPress={() => {
              this.setState({
                dialogMode: 'New_List',
                nameValue: '',
                dialogBoxTitle: 'Enter New List Name'
              })
              this.setNameDialogVisible(true)
            }}
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
      return (
        <Item
          title={item.tableName}
          multiSelectMode={multiSelectMode}
          onPress={() => this.props.navigation.navigate('TableContent',
            {
              tableName: item.tableName
            })}
          handleLongPress={() => this.handleMultipleSelection(item.index_no)}

          style={{ backgroundColor }}
        />
      )
    }

    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={this.state.tablesList}
          extraData={this.state}
          inverted={false}
          renderItem={renderItem}
          keyExtractor={item => item.index_no.toString()}
        />

        <FAB
          style={styles.addFab}
          icon={() => (<MaterialCommunityIcons style={[{ color: "#fff" }]} size={26} name={'plus'} />)}
          onPress={() => {
            var today = new Date();
            date = today.getDate() + "_" + parseInt(today.getMonth() + 1) + "_" + today.getFullYear();
            this.setState({
              dialogMode: 'New_List',
              nameValue: 'List_' + date,
              dialogBoxTitle: 'Enter New List Name'
            })
            this.setNameDialogVisible(true)
          }}
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  heading: {
    flex: 4,
    fontSize: 20,
    textAlign: "center",
    color: '#fff',
    fontWeight: "bold"
  },
  exportButton: {
    flex: 3,
    width: 50,
    alignItems: "flex-end"
  },
  exportButtonContainer: {
    width: 100,
    height: 40,
    flexDirection: "row",
    backgroundColor: "#007acc",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10
  },
  exportIcon: {
    color: "#fff"
  },
  exportText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff"
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
    paddingLeft: 10,
    textAlign: "right"
  },
  name: {
    flex: 10,
    flexDirection: "column",
    marginLeft: 20,
    fontSize: 20,
    paddingVertical: 14,
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
  addFab: {
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
