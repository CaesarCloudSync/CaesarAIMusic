import { View ,Alert,Text} from "react-native";
import { SearchBar } from 'react-native-elements';
import {Picker} from "@react-native-picker/picker";
import { useState } from "react";
import Icon from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import { ActivityIndicator } from "react-native";
import * as ScopedStorage from 'react-native-scoped-storage';
import ytdl from "react-native-ytdl"
//import util from 'util'
import * as downloadDirs from './downloadDirs';
import RNFS from 'react-native-fs';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import RNFetchBlob from 'rn-fetch-blob'
import { requestStoragePermission } from "./askpermission";
import ytpl from "react-native-ytpl"
export default function CaesarSongSearch(){
    const [youtubeurl,setYouTubeURL] = useState("")
    const [selectedLanguage, setSelectedLanguage] = useState("album");
    const [album,setALbum] = useState("")
    const searchbarstyles = {width:300,height:70}
    const [showSearch,setShowSearch] = useState(false);
    const [loading,setLoading] = useState(false)
    const [progressmeessage,setProgressMessage] = useState("")
    const [downloading,setDownloading] = useState(false)
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

    async function addSong(url) {
      setDownloading(true);
      //const getInfo = util.promisify(ytdl.getInfo);

      //let youtubeurlt = "https://www.youtube.com/watch?v=CPpyc-mrb5k"
      try {
        const id = ytdl.getVideoID(url);
        //console.log(id)
        const info = await ytdl.getInfo(id);
        //console.log(info)
        let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

        const format = ytdl.chooseFormat(audioFormats, {quality: 'highest'});
        let songurl = format.url
        let name = info.videoDetails.title
        let filename = `${name.replaceAll(/[/\\?%*:|"<>]/g, '_')}.mp3`
        //console.log(songurl)
        console.log(filename)
     
        //downloadFile("https://file-examples.com/wp-content/storage/2017/11/file_example_MP3_700KB.mp3",filename)
        await requestStoragePermission()
        const { config, fs } = RNFetchBlob;
        let PictureDir = fs.dirs.MovieDir
        let options = {
          fileCache: true,
          addAndroidDownloads: {
            // Related to the Android only
            useDownloadManager: true,
            notification: true,
            path:
              PictureDir + "/" + filename,
            description: 'Downloading:'+ name + "...",
          },
        };
        config(options)
          .fetch('GET', songurl)
          .then(res => {
            // Showing alert after successful downloading
            console.log('res -> ', JSON.stringify(res));
            Alert.alert(`Success downloading ${name}`)
            setDownloading(false);
            //alert('Image Downloaded Successfully.');
          }).catch(
            (err) =>{
              Alert.alert("Error:" + err)
            }
          )
          ;
      
        
    } catch (err) {
      console.log(err)
      Alert.alert(`Error downloading from ${url}`)
    }
  
  }
  async function addSongs() {
    let youtubeurlnotm = youtubeurl.replace("m.","")
    if (youtubeurlnotm !== "" && youtubeurlnotm.includes("https")){
        if (youtubeurlnotm.includes("list=")){
        //const id = ytdl.ge
        //https://www.youtube.com/watch?v=UU_aEa8K-EOJ3D6gOs7HcyNg
        console.log("hi")
        const plid = ytpl.getPlaylistID(youtubeurlnotm)
        const playlist = await ytpl(plid["_j"]);
        
        playlist.items.map(async (video) => {
          let url = video.shortUrl
          //console.log(url)
          await addSong(url)
        })
      }
      else{

      
        await addSong(youtubeurlnotm)
    
    
      }
  }


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
        placeholder="Enter Youtube URL:"
        onChangeText={setYouTubeURL}
        value={youtubeurl}/>
 


            {downloading === false ? <Icon.Button  onPress={addSongs}>Download</Icon.Button>:
            <ActivityIndicator style={{marginTop:10}}></ActivityIndicator>}
            
            
            </View>}

        </View>
    )
}

/*
            <Picker style={searchbarstyles}
            selectedValue={selectedLanguage}
            onValueChange={(itemValue, itemIndex) =>
                setSelectedLanguage(itemValue)
            }>
            <Picker.Item label="Album" value="album" />
            <Picker.Item label="Song" value="song" />
            </Picker> */