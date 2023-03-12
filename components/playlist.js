import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Button,
} from 'react-native';
import TrackPlayer, {
  useTrackPlayerEvents,
  usePlaybackState,
  Event,
  State
} from 'react-native-track-player';
import Icon from 'react-native-vector-icons/FontAwesome';
import { setupPlayer, addTracks } from '../trackPlayerServices';

export default function Playlist(props) {
    const [queue, setQueue] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
  
    async function loadPlaylist() {
      const queue = await TrackPlayer.getQueue();
      setQueue(queue);
      setIsPlayerReady(false)
    }
  
    useEffect(() => {
      loadPlaylist();
    }, [isPlayerReady]);
  
    useTrackPlayerEvents([Event.PlaybackTrackChanged], (event) => {
      if(event.state == State.nextTrack) {
        TrackPlayer.getCurrentTrack().then((index) => setCurrentTrack(index));
      }
    });
  
    function PlaylistItem({index, title, isCurrent}) {
  
      function handleItemPress() {
        TrackPlayer.skip(index);
      }
  
      return (
        <TouchableOpacity onPress={handleItemPress}>
          <Text
            style={{...styles.playlistItem,
              ...{backgroundColor: isCurrent ? '#666' : 'transparent'}}}>
          {title}
          </Text>
        </TouchableOpacity>
      );
    }
  
    async function handleShuffle() {
      let queue = await TrackPlayer.getQueue();
      await TrackPlayer.reset();
      queue.sort(() => Math.random() - 0.5);
      await TrackPlayer.add(queue);
  
      loadPlaylist()
    }
    async function setupReset() {
      let isSetup = await setupPlayer();
      await TrackPlayer.reset()
      //const queue = await TrackPlayer.getQueue();
      await addTracks();
      setIsPlayerReady(isSetup);
    }


  
    return(
      <View style={{flex:1}}>
        <Controls setSeek={props.setSeek} onShuffle={handleShuffle}/>
        <View style={styles.playlist}>
          <Button title='Change Songs' onPress={setupReset}></Button>
          <FlatList
            data={queue}
            renderItem={({item, index}) => <PlaylistItem
                                              index={index}
                                              title={item.title}
                                              isCurrent={currentTrack == index }/>
            }
          />
        </View>
        
      </View>
    );
  }

  function Controls(props) {
    const onShuffle  = props.onShuffle
    const setSeek = props.setSeek

    const playerState = usePlaybackState();
  
    async function handlePlayPress() {
      setSeek(0)
      if(await TrackPlayer.getState() == State.Playing) {
        TrackPlayer.pause();
      }
      else {
        TrackPlayer.play();
      }
    }
  
    return(
      <View style={{flexDirection: 'row',
        flexWrap: 'wrap', alignItems: 'center',justifyContent:"center"}}>
          <Icon.Button
            name="arrow-left"
            size={28}
            backgroundColor="transparent"
            onPress={() => {TrackPlayer.skipToPrevious();setSeek(0)}}/>
          <Icon.Button
            name={playerState == State.Playing ? 'pause' : 'play'}
            size={28}
            backgroundColor="transparent"
            onPress={handlePlayPress}/>
          <Icon.Button
            name="arrow-right"
            size={28}
            backgroundColor="transparent"
            onPress={() => {TrackPlayer.skipToNext();setSeek(0)}}/>
          <Icon.Button
            name="random"
            size={28}
            backgroundColor="transparent"
            onPress={onShuffle}/>
      </View>
    );
  }
const styles = StyleSheet.create({
    playlistItem: {
        fontSize: 16,
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 8,
        paddingRight: 8,
        borderRadius: 4
      },
      playlist: {
        flex:1,
        marginTop: 40,
        marginBottom: 40
      }
})