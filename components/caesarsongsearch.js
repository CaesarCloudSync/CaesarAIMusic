import { View ,Alert,Text} from "react-native";
import { SearchBar } from 'react-native-elements';
import {Picker} from "@react-native-picker/picker";
import { useState } from "react";
import Icon from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import { ActivityIndicator } from "react-native";
import * as ScopedStorage from 'react-native-scoped-storage';



import RNFetchBlob from 'rn-fetch-blob'
export default function CaesarSongSearch(){
    const [artist,setArtist] = useState("")
    const [selectedLanguage, setSelectedLanguage] = useState("album");
    const [album,setALbum] = useState("")
    const searchbarstyles = {width:300,height:70}
    const [showSearch,setShowSearch] = useState(false);
    const [loading,setLoading] = useState(false)
    const [progressmeessage,setProgressMessage] = useState("")
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }
    const MyActivityIndicator = () => {
      return (
            <View style={{ flex: 1, justifyContent: "center",alignItems:"center"}}>
          <ActivityIndicator style={{position:"relative",top:40,right:7}} size="large" color="blue" />
            </View>
        );
    }
    const arrayBufferToFile = (buffer, filename) => {
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        return new File([blob], filename, { type: 'application/octet-stream' });
      };
      const checkPermission = async () => {
    
        // Function to check the platform
        // If Platform is Android then check for permissions.
    
        if (Platform.OS === 'ios') {
          downloadFile();
        } else {
          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              {
                title: 'Storage Permission Required',
                message:
                  'Application needs access to your storage to download File',
              }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              // Start downloading
              downloadFile();
              console.log('Storage Permission Granted.');
            } else {
              // If permission denied then show alert
              Alert.alert('Error','Storage Permission Not Granted');
            }
          } catch (err) {
            // To handle permission related exception
            console.log("++++"+err);
          }
        }
      };
    
      const downloadFile = (fileUrl,filename) => {
       
        // Get today's date to add the time suffix in filename
        let date = new Date();
        // File URL which we want to download
        let FILE_URL = fileUrl;    
        // Function to get extention of the file url
        let file_ext = getFileExtention(FILE_URL);
       
        file_ext = '.' + file_ext[0];
       
        // config: To get response by passing the downloading related options
        // fs: Root directory path to download
        const { config, fs } = RNFetchBlob;
        let RootDir = fs.dirs.PictureDir;
        let options = {
          fileCache: true,
          addAndroidDownloads: {
            path:
              RootDir+
              "/"+
              filename,
            description: 'downloading file...',
            notification: true,
            // useDownloadManager works with Android only
            useDownloadManager: true,   
          },
        };
        config(options)
          .fetch('GET', FILE_URL)
          .then(res => {
            // Alert after successful downloading
            console.log('res -> ', JSON.stringify(res));
            //alert('File Downloaded Successfully.');
          });

      };
    
      const getFileExtention = fileUrl => {
        // To get the file extension
        return /[.]/.exec(fileUrl) ?
                 /[^.]+$/.exec(fileUrl) : undefined;
      };
    const DownloadSongs = () => {
      const allsongs = []
      setLoading(true)
        setShowSearch(false)
        var ws = new WebSocket('wss://palondomus-caesarmusic.hf.space/caesarmusicws');
        ws.onopen = () => {
        // connection opened
        //console.log(selectedLanguage)
        const albumfilt = album.includes("youtube") ? album : album.toLowerCase()
        let send_data = JSON.stringify({"artist":artist.toLowerCase(),"album":albumfilt,"album_or_song":selectedLanguage})
        //console.log(send_data)
        ws.send(send_data); // send a message
        };
        
        ws.onmessage = (e) => {
                    // a message was received
        
        /*if (e.data instanceof ArrayBuffer ){
            var buffer = e.data;
            
            console.log(buffer.toString('base64'))
            let musicfilename = arrayBufferToFile(buffer,"name.mp3")
            //RNFS.downloadFile()
            //RNFS.writeFile(filename, response.data,'')

            console.log("Received arraybuffer");
         }*/
        
        if (typeof(e.data) === "string"){
            //create a JSON object
            let jsonObject = JSON.parse(e.data);
            let filename = jsonObject.filename
            if (filename !== undefined){
            allsongs.push(filename)
            downloadFile(`https://palondomus-caesarmusic.hf.space/caesarmusicsongload/${filename}`,filename)
            }
            if ("message" in jsonObject){
                if (jsonObject.message === "all songs are downloaded"){
                    fetch(
                        'https://palondomus-caesarmusic.hf.space/caesarcleanup'
                      ).then((resp) => resp.json())
                      .then((json) => console.log(json))
                      setLoading(false)
                      Alert.alert(`${capitalizeFirstLetter(album)} - ${capitalizeFirstLetter(artist)} downloaded!`,`All ${allsongs.length} Songs Downloaded.`)
                      setProgressMessage("")
                      ws.close()
            

                }
                else if (jsonObject.message !== "all songs are downloaded"){
                  if (jsonObject.message === "No song detected"){
                    setLoading(false)
                    Alert.alert(`${capitalizeFirstLetter(album)} - ${capitalizeFirstLetter(artist)} Not found!`,`${jsonObject.message}`)
                    setProgressMessage("")
                    ws.close()

                  }
                  else if (jsonObject.message !== "No song detected"){
                    setProgressMessage(`${filename} - ${jsonObject.message}`)
                  }
                  
               }
            }
            //console.log(jsonObject)
         }

        };
        

        ws.onerror = (e) => {
        // an error occurred
        setLoading(false)
        Alert.alert(`${capitalizeFirstLetter(album)} - ${capitalizeFirstLetter(artist)} not downloaded!`,`Songs could not be downloaded.`)
        ws.close()
        console.log(e.message);
        };
        

        
    }

    return(
        <View style={{display:"flex",justifyContent:"flex-end",alignItems:"flex-end"}}>
        <View style={{display:"flex",flexDirection:"row"}}>
        
        <Icon name={showSearch === false ? "search":"close"} size={30} style={{position:"relative",right:10,top:10,marginBottom:10}} onPress={() => {if(showSearch === false){setShowSearch(true)}else{setShowSearch(false)}}}/>
        </View>
        {loading === true && <MyActivityIndicator ></MyActivityIndicator>}
        <Text style={{position:"relative",top:5}}>
        {progressmeessage}
        </Text>
        {showSearch === true &&
        <View>
        <SearchBar
        containerStyle={searchbarstyles}
        placeholder="Enter Artist:"
        onChangeText={setArtist}
        value={artist}/>
 
        <SearchBar
            containerStyle={searchbarstyles}
            placeholder="Enter Album:"
            onChangeText={setALbum}
            value={album}/>
            <Picker style={searchbarstyles}
            selectedValue={selectedLanguage}
            onValueChange={(itemValue, itemIndex) =>
                setSelectedLanguage(itemValue)
            }>
            <Picker.Item label="Album" value="album" />
            <Picker.Item label="Song" value="song" />
            </Picker>
            <Icon.Button onPress={DownloadSongs}>Download</Icon.Button></View>}

        </View>
    )
}