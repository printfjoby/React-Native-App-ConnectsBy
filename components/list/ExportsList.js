import React, { Component } from 'react';
import {
  StyleSheet, SafeAreaView, FlatList, View, Text, Button, TouchableOpacity, ActivityIndicator,
  Alert, BackHandler, Platform, PermissionsAndroid, TextInput
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Menu, { MenuItem } from 'react-native-material-menu';
import { Dialog, Portal, Provider } from 'react-native-paper';
import Share from "react-native-share";
var RNFS = require('react-native-fs');
import FileViewer from 'react-native-file-viewer';
import Database from '../backend/Database';
import { exp } from 'react-native-reanimated';


const db = new Database();

const Item = ({ title, multiSelectMode, handleOnPress, handleLongPress, style }) => (
  <TouchableOpacity
    onPress={multiSelectMode ? handleLongPress : handleOnPress}
    onLongPress={handleLongPress}
    style={[styles.item, style]}>
    <MaterialCommunityIcons color={"#4da6ff"} style={styles.leftIcon} size={26} name={'file-table'} />
    <Text style={styles.name} numberOfLines={1}>{title}</Text>
    <View style={styles.listIcon}>
      <MaterialCommunityIcons color={"grey"} size={16} name={'greater-than'} />
    </View>
  </TouchableOpacity>
);

export default class ExportsList extends Component {
  constructor(props) {
    super(props);

    //this.handleMultipleSelection = this.handleMultipleSelection.bind(this);
    this.state = {
      exportsList: [],
      exportDirectorypath: '',
      itemSelected: false,
      bannerVisible: true,
      isRenameDialogVisible: false,
      renameValue: '',
      renameTitle: '',
      selectedIds: [],
      isLoading: true
    };
  }

  componentDidMount() {
    this.focusListner = this.props.navigation.addListener("focus", () => {
      this.getExportsList();
    })
  }

  componentWillUnmount() {
    if (this.state.itemSelected) {
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }
  }

  //Called form getExports method. Used to set state variables
  setStateVariables() {
    let exportDirectorypath = this.state.exportDirectorypath
    RNFS.readDir(exportDirectorypath)
      .then((result) => {
        let expList = [];
        let len = result.length;
        for (let i = len - 1; i >= 0; i--) {
          let row = result[i];
          const { isFile, mtime, name, path, size } = row;
          let sl_no = i + 1;
          expList.push({
            sl_no,
            isFile,
            mtime,
            name,
            path,
            size
          });
        }
        this.setState({
          exportsList: expList,
          itemSelected: false,
          renameValue: '',
          selectedIds: [],
          isLoading: false
        })
        this.props.navigation.setOptions({
          headerTitle: () => { return (<Text style={styles.heading} >Exports</Text>) },
          headerRight: null
        })
        //console.log('RESULT', result[0].name.slice(0, -4))
      })
      .catch((err) => {
        console.log(err);
        this.setState({ isLoading: false })
        Alert.alert('Loading Failed', 'Please try again', [{ text: 'Ok', style: 'default' }]);
      });
  }

  //initializes state variables
  getExportsList() {
    this.setState({ isLoading: true });
    try {
      if (Platform.OS === 'ios') {
        let path = RNFS.DocumentDirectoryPath;//iOS only
        this.setState(
          { exportDirectorypath: path },
          function () {
            this.setStateVariables();
          })
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
          //console.log(path)
          this.setState({
            exportDirectorypath: path
          })
          this.setStateVariables()
        })
      }
    } catch (err) {
      console.log(err);
      this.setState({
        isLoading: false
      })
      Alert.alert('Something Went Wrong', 'Please try again', [{ text: 'Ok', style: 'default' }]);
    }
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


  //Select all people
  selectAll = () => {
    this.hideMenu();
    let allIds = [];
    let exportsList = this.state.exportsList;
    for (let i = 0; i < exportsList.length; i++) {
      allIds[i] = exportsList[i]["sl_no"];
    }
    this.setState({
      selectedIds: allIds
    });
    this.selectionHeader(allIds.length);
  }

  handleBackButton = () => {
    if (this.state.itemSelected) {
      this.getExportsList()
      return true;
    } else {
      return false;
    }
  };
  //adding selected item ids to a state variable array 
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
      this.getExportsList();
    }
  }

  //Show open with dialog on pressing a list item
  handleOnPress = (path) => {
    FileViewer.open(path, { showOpenWithDialog: true })
      .then(() => {
        console.log("open Success")
      })
      .catch(error => {
        console.log(error);
      });
  }

  //delete
  performDelete(filePath) {
    return new Promise((resolve) => {
      RNFS.exists(filePath)
        .then((exists) => {
          if (exists) {
            //console.log(exists)
            RNFS.unlink(filePath)
              .then(() => {
                console.log("Deleted");
                resolve(true);
              })
              .catch((err) => {
                resolve(false);
              });
          } else {
            console.log("File not found");
            resolve(false);
          }
        })
        .catch((err) => {
          console.log(err);
          resolve(false);
        });
    });
  }

  deleteFiles() {
    this.setState({
      isLoading: true
    });
    let selectedIds = this.state.selectedIds;
    let exportsList = this.state.exportsList;
    let promises = [];
    for (let i = 0; i < selectedIds.length; i++) {
      for (let j = 0; j < exportsList.length; j++) {
        if (selectedIds[i] == exportsList[j].sl_no) {
          let filePath = exportsList[j].path;
          promises.push(this.performDelete(filePath));
        }
      }
    }
    Promise.all(promises)
      .then((results) => {
        let failedCount = 0;
        let successCount = 0;
        results.forEach((result) => {
          if (result) {
            successCount++;
          } else {
            failedCount++;
          }
        })
        let msg = failedCount === 0 ? successCount + " Successfull" : successCount + " Successfull & " + failedCount + " Failed"
        Alert.alert('Deleted Files', msg, [{ text: 'Ok', onPress: () => this.getExportsList(), style: 'default' }]);
        this.setState({ isLoading: false })
      })
      .catch((e) => {
        console.log(e)
        Alert.alert('Failed', 'Unable to delete files', [{ text: 'Ok', style: 'default' }]);
        this.setState({ isLoading: false })
      });
  }

  deleteList = () => {
    this.hideMenu();
    return (
      Alert.alert('Are you Sure?', 'Delete ' + this.state.selectedIds.length + ' List',
        [{ text: 'Delete', onPress: () => this.deleteFiles(), style: 'destructive' }, { text: 'Cancel', style: 'cancel' }])
    )
  }

  //Rename
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

  performRename(newName) {
    let newPath = this.state.exportDirectorypath + "/" + newName + ".csv";
    let exportsList = this.state.exportsList;
    let selectedIds = this.state.selectedIds;
    let oldPath;
    exportsList.some((item) => {
      if (item.sl_no === selectedIds[0]) {
        oldPath = item.path;
      }
    })
    RNFS.exists(newPath)
      .then((exists) => {
        if (exists) {
          this.setState({
            renameTitle: 'File name already exists! Please try another',
            isLoading: false,
            isRenameDialogVisible: true
          })
        } else {
          RNFS.read(oldPath)
            .then((existingFile) => {
              RNFS.writeFile(newPath, existingFile)
                .then((success) => {
                  RNFS.unlink(oldPath)
                    .then(() => {
                      console.log("Renamed");
                      Alert.alert('Renamed', 'Successfully', [{ text: 'Ok', onPress: () => this.getExportsList(), style: 'default' }]);
                      this.setState({ isLoading: false })
                    })
                    .catch((err) => {
                      console; e.log(err)
                      this.setState({ isLoading: false })
                      Alert.alert('Warning', 'Failed to delete old file', [{ text: 'Ok', style: 'default' }]);
                    });
                })
                .catch((err) => {
                  console.log(err);
                  this.setState({ isLoading: false })
                  Alert.alert('Failed to rename', 'Please try again', [{ text: 'Ok', style: 'default' }]);
                });
            })
            .catch((err) => {
              console.log(err);
              this.setState({ isLoading: false })
              Alert.alert('Failed to rename', 'Please try again', [{ text: 'Ok', style: 'default' }]);
            });
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({ isLoading: false })
        Alert.alert('Failed to rename', 'Please try again', [{ text: 'Ok', style: 'default' }]);
      });

  }

  renameList = () => {
    this.hideMenu();
    let exportsList = this.state.exportsList;
    let selectedIds = this.state.selectedIds;
    let listName;
    exportsList.map((item) => {
      if (item.sl_no === selectedIds[0]) {
        listName = item.name.slice(0, -4);
      }
    })
    this.setState({
      renameValue: listName,
      renameTitle: 'Please enter the new name ',
      isRenameDialogVisible: true
    })
  }

  //share
  performShareList = () => {
    this.setState({ isLoading: true })
    let selectedIds = this.state.selectedIds;
    let exportsList = this.state.exportsList;
    let files = [];
    for (let i = 0; i < selectedIds.length; i++) {
      for (let j = 0; j < exportsList.length; j++) {
        if (selectedIds[i] == exportsList[j].sl_no) {
          let filePath = "file://" + exportsList[j].path;
          files.push(filePath);
        }
      }
    }

    Share.open({
      urls: files
    })
      .then((res) => {
        console.log(res)
        this.getExportsList()
        this.setState({ isLoading: false })
      })
      .catch((err) => {
        console.log(err);
        this.setState({ isLoading: false })
      });

  }

  shareList = () => {
    this.hideMenu();
    return (
      Alert.alert('Share List', 'Do you want to share ' + this.state.selectedIds.length + ' lists',
        [{ text: 'Share', onPress: () => this.performShareList(), style: 'default' }, { text: 'Cancel', style: 'cancel' }])
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
            <TouchableOpacity onPress={() => this.getExportsList()} >
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
                <MenuItem onPress={this.deleteList}>Delete</MenuItem>
                <MenuItem onPress={this.renameList}>Rename</MenuItem>
                <MenuItem onPress={this.shareList}>Share</MenuItem>
              </>
              :
              <>
                <MenuItem onPress={this.selectAll}>Select All</MenuItem>
                <MenuItem onPress={this.deleteList}>Delete</MenuItem>
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

    //If Table is empty
    if (this.state.exportsList.length == 0) {
      return (
        <View style={styles.msgContainer}>
          <Text style={styles.msg}> No Exports Found </Text>
        </View>
      );
    }

    //creating list item Component
    let renderItem = ({ item }) => {
      //change color of selected items
      let backgroundColor = this.state.selectedIds.includes(item.sl_no) ? "#e6e6e6" : "#ffffff";
      //multiSelectMode isused to change the behaviour of onPress action from view mode to select mode
      let multiSelectMode = (this.state.selectedIds && this.state.selectedIds.length) ? true : false;
      return (
        <Item
          title={item.name}
          multiSelectMode={multiSelectMode}
          handleOnPress={() => this.handleOnPress(item.path)}
          handleLongPress={() => this.handleMultipleSelection(item.sl_no)}
          style={{ backgroundColor }}
        />
      )
    }

    if (this.state.isRenameDialogVisible) {
      return (
        <Provider>
          <Portal>
            <Dialog style={{ paddingBottom: 20 }}
              visible={this.state.isRenameDialogVisible}
            // onDismiss={() => {this.setIsRenameDialogVisible(false); this.getPeople()}}
            >
              <Dialog.Title>{this.state.renameTitle}</Dialog.Title>
              <Dialog.Content>
                <TextInput
                  value={this.state.renameValue}
                  autoFocus={true}
                  onChangeText={this.handleRenameChange}
                />
              </Dialog.Content>
              <Dialog.Actions style={{ justifyContent: "space-evenly" }}>
                <Button onPress={() => this.setIsRenameDialogVisible(false)} title={"Cancel"} />
                <Button onPress={() => { this.setIsRenameDialogVisible(false); this.performRename(this.state.renameValue) }} title={"Rename"} />
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </Provider>)
    }

    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={this.state.exportsList}
          extraData={this.state}
          renderItem={renderItem}
          keyExtractor={item => item.sl_no.toString()}
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
  msgContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff"
  },
  msg: {
    fontSize: 18,
    fontStyle: "italic"
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
  heading: {
    fontSize: 18,
    color: '#fff',
    fontWeight: "bold"
  },
  moreButton: {
    marginRight: 20,
  }
});