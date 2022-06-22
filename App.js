import logo from './images/kejiLogo.png';
import './css/main.css';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {useEffect, useState} from 'react';
import axios from 'axios';
import spotifyLogo from './images/spotifyLogo.png';
import Modal from './components/Modal.js';
import Instructions from './components/Instructions';

function App() {
   
  const CLIENT_ID = '401f773892cf4ad6b047d811d52677a7'
  const REDIRECT_URI = 'http://localhost:3000'
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
  const RESPONSE_TYPE = 'token'
  const SCOPE = 'playlist-modify-private playlist-modify-public playlist-read-private playlist-read-collaborative'
  const spotifyLink = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`

  const [token, setToken] = useState('')


  const getToken = () => {
      let urlParams = new URLSearchParams(window.location.hash.replace('#','?'));
      let token = urlParams.get('access_token');
      window.localStorage.setItem("token", token)
      setToken(token)
  }
  useEffect(() => {
      getToken()
  }, [])

  const spotifyAuth = () => {
    window.location.href = spotifyLink
  }


  const logout = () => {
      setToken('')
      window.localStorage.removeItem('token')
      window.location.href = ''
  }

  //Need to find a new naming scheme 
  const [searchKey1, setSearchKey1] = useState("")
  const [searchKey2, setSearchKey2] = useState("")
  const [playlist1, setPlaylist1] = useState([])
  const [playlist2, setPlaylist2] = useState([])
  const [matches, setMatches] = useState([])
  const [playlistName1, setPlaylistName1] = useState('')
  const [playlistName2, setPlaylistName2] = useState('')
  const [profile, setProfile] = useState({})
  const [matchesInfo, setMatchesInfo] = useState([])
  
 
  const getName = async (code) => {
    const {data} = await axios.get(`https://api.spotify.com/v1/playlists/${code}`, {
      headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
      },
    })
    return(data)
  }

  const getTracks = async (code) => {

    let playlist = []
    let i = 0
    while (true){
      let offset = i * 100
      const {data} = await axios.get(`https://api.spotify.com/v1/playlists/${code}/tracks`, {
        params: {
          limit: 100,
          offset: offset,
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
      })
      if(data.items.toString() == [].toString()) {
        break;
      }
      for (let song in data.items) {
        if (data.items[song].track !== null) {
          playlist.push(data.items[song])
        }
      }
      i++
    }

    return (playlist)
  }

  const searchPlaylist1 = async (e) => {
    
    e.preventDefault()

    let code = searchKey1.replace('https://open.spotify.com/playlist/', '').split('?')[0]
    let playlist = await getTracks(code)
    console.log('playlist 1:', playlist)


    setPlaylist1(playlist)
    let data = await getName(code)
    setPlaylistName1(data)
  }

  const searchPlaylist2 = async (e) => {
    e.preventDefault()

    let code = searchKey2.replace('https://open.spotify.com/playlist/', '').split('?')[0]
    let playlist = await getTracks(code)
    console.log('playlist 2:', playlist)


    setPlaylist2(playlist)
    let data = await getName(code)
    setPlaylistName2(data)
  }

  const getArtists = (song) => {
    console.log(song.track.artists)
    let artists = ''
    for (let i in song.track.artists){
      artists = `${artists}, ${song.track.artists[i].name}`
    }
    artists = artists.substring(1, artists.length)
    return artists
  }


  const playlistMapTemplate = song => (
    <div className = 'song'>
      {song.track.album.images.length ? <img height = {'45vh'} src = {song.track.album.images[1].url} alt=''/> : <div> No Image </div>}
      <div className='songLabel'>
        <h1 className='songName'>
          {song.track.name}
        </h1>
        
        <h1 className = 'artist'>
          {getArtists(song)}
        </h1>
      </div>
    </div>
  )

  const renderPlaylist1 = () => {
    
    return playlist1.map(playlistMapTemplate)
  } 

  const renderPlaylist2 = () => {
    return playlist2.map(playlistMapTemplate)
  } 

  const matchSongs = () => {

    let sameSongs = []
    
    for (let x in playlist1) {
      for (let y in playlist2) {
        if(playlist1[x]['track']['uri'] == playlist2[y]['track']['uri']) {
          sameSongs.push(playlist1[x])
        }
      }
    }

    let filteredSongs = {}
    for (let i in sameSongs) {
      filteredSongs[sameSongs[i]['track']['uri']] = sameSongs[i]
    }

    let filteredSongsArray = []
    for (let i in filteredSongs) {
      filteredSongsArray.push(filteredSongs[i])
    }


    setMatches(filteredSongsArray)

    if (sameSongs.length===0){
      setMatches([])
    }
    else{ 
      console.log('matching songs:', filteredSongsArray)
    }



  }


  useEffect(() => {
    matchSongs()
  },[playlist1, playlist2])


  







  const renderMatches = () => {

    return matches.map(playlistMapTemplate)
  }
   
  const searchProfile = async () => {
    try {
      const {data} = await axios.get(`https://api.spotify.com/v1/me`, {
      headers: {
          Authorization: `Bearer ${token}`,
      },
    })
    console.log(data)
    setProfile(data)
    }
    catch {
    }
    
  }

  useEffect(() => {
    searchProfile()
  }, [token])


 

  const [modalState, setModalState] = useState(false)
 
  const modalClose = () => {
    setModalState(false)
  }
  const modalOpen = () => {
    setModalState(true)
  }


  // const test = () => {  
  //   console.log('Playlist 1:')
  //   console.log(playlist1)
  //   console.log('Playlist 2:')
  //   console.log(playlist2)
  //   console.log('Matches:')
  //   console.log(matches)
  //   console.log('profile:')
  //   searchProfile()
  //   console.log(playlistName1)
  // }


  const makePlaylist = async () => {
    let id = profile.id
    let name = `「${playlistName1.name}」 × 「${playlistName2.name}」 had a child. This is it.`
    let description = `「${playlistName1.owner.display_name} × ${playlistName2.owner.display_name}」`
    console.log(name)
    let songs = []
    for (let i in matches) {
      songs.push(matches[i].track.uri)
    }
    
    const create = await axios.post(`https://api.spotify.com/v1/users/${id}/playlists`, 
      {
        'name' : name,
        'description' : description,
        'public' : false
      }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
      },
    })

    console.log(create)

    
    let playlistID = create.data.id

    for (let i = 0; i< Math.ceil(songs.length/100); i++) {

      let songSection = songs.slice(i*100, (i+1)*100)

      await axios.post(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, 
      {
        'uris' : songSection
      }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
      },
    })
    }

    
  }


  const hm = (e) => {
    searchPlaylist1(e)
    searchPlaylist2(e)
    matchSongs()
  }


  const playlistInfo = async () => {
    for (let i = 0; i < Math.ceil(matches.length/100); i++) {

      let matchesSection = matches.slice(i*100, (i+1)*100)
      let ids = ''

      for (let song in matchesSection) {
        ids = `${(matchesSection[song].track.id)},${ids}`
      }
      ids = ids.substring(0, ids.length-1)
      console.log(ids)
      const {data} = await axios.get(`https://api.spotify.com/v1/audio-features/`, {
        params: {
          ids: ids,
        },
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
      })

      console.log(data)
    }

      
  }
 
  useEffect(() => {
    playlistInfo()
  }, [matches])

  const renderPlaylistInfo = async () => {
    
    // const {data} = await axios.get(`https://api.spotify.com/v1/audio-features/`, {
    //   params: {
    //     ids: 100,
    //   },
    //   headers: {
    //       Accept: 'application/json',
    //       Authorization: `Bearer ${token}`,
    //       'Content-Type': 'application/json',
    //   },
    //   })
  }



  return (
    <div className="main-container">        
        <div className="content">
          <div className = 'mainNavbar'>
              <div className="topNavbar">
                  <h1>Sonus</h1>                 
                  {!token ? 
                    <motion.button 
                      whileHover=  {{ color: '#e05b64'}}
                      whileTap={{ scale: .98}}
                      className= 'Spot'
                      onClick = {spotifyAuth}
                    >
                      <img src={spotifyLogo} alt ='login'/>
                      <div className = 'spotifyText'>Connect to Spotify</div>
                    </motion.button>
                    : 
                    <motion.button 
                      whileHover=  {{ color: '#e05b64'}}
                      whileTap={{ scale: .98}}
                      className= 'Spot'
                      onClick={logout}
                    >
                      <img src={spotifyLogo} alt ='logout'/>
                      <div className = 'spotifyText'>Disconnect from Spotify</div>
                    </motion.button>
                  }

                
              </div>
                    
              <div className="bottomNavbar">
                
                <h1>How compatible is your music?</h1>

                <div className="about">
                    <motion.button 
                      whileHover=  {{ color: '#f3a6ab'}}
                      whileTap={{ scale: .95  }}
                      className = 'aboutButton'
                      
                      onClick={()=> (modalState ? modalClose() : modalOpen())}
                    >
                      <div className = 'aboutText'>About</div>
                    </motion.button>
                </div>
              </div>
          </div>

          
          {token ? 
 
            <div className = 'search'>
              <form onSubmit={hm}>
                <input className = 'searchInput' type="text" placeholder= 'Playlist Link' onChange={e => setSearchKey1(e.target.value)}/>
                <button type={"submit"}>✓</button>
              </form>

              <form onSubmit={hm}>
                <input className = 'searchInput' type="text" placeholder= 'Playlist Link' onChange={e => setSearchKey2(e.target.value)}/>
                <button type={"submit"}>✓</button>
              </form>
              <div> 
                {/* <button onClick={matchSongs}> Match Songs! </button> */}
                <button onClick={makePlaylist}> Make Playlist</button>
                {/* <button onClick={test}>TEST</button> */}
              </div>
              {/* <div>
                <button>hi</button>
              </div> */}
              
            </div> 

            :

            <div> </div> 
          }

          {token? 
            <div className = 'results'> 
              <div className = 'resultsHeader'>
                <h1>{playlistName1.name}</h1>
                <h1>{playlistName2.name}</h1>
                <h1>Similar Songs</h1>
              </div>
              <div className = 'resultsContent'>
                <div className = 'playlists'>
                  {renderPlaylist1()}
                </div>
                <div className = 'playlists'>
                  {renderPlaylist2()}
                </div>
                <div className = 'playlists'>
                  {renderMatches()}
                </div>
                {/* <div className = 'info'>
                  {renderPlaylistInfo()}
                </div> */}
              </div>
            </div>
            :
            <div className = 'instructions'> 
            {Instructions()}
            </div>
          }
        
          </div>

        
        <img className= 'keji' src = {logo}/>
        <AnimatePresence exitBefore={true} onExitComplete={()=>null}>
          {modalState && <Modal modalOpen={modalState} handleClose={modalClose}/>}
        </AnimatePresence>
        

    </div>
  );
}

export default App;
