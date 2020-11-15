// React and CSS Imports
import React from "react";
import "./App.scss";
import "globals/hack-styles.scss";

// Installed dependency imports
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";

// for API data
import axios from "axios";
import {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";

// Website imports for classes you made
import { Card } from "app/containers";
import { Flower } from "app/containers";
import { Garden } from "app/containers";

// temporary constant that will be generated by users later
const tempToken = "BQCNt38nbf9tp3-eRcXe5gdEU34aqgShzwaZC9aDOzKoG9Ho1k_0GUWUVsetkDZpUJBgVlSKZYkgayiTELOg1JmEFDQy4T9VZJEEiWCNM9ovyRb5fLtFOMR0G5DeXrGYr-MzVrhstBYv1e1SwZcj"
const authorizationURL = "https://accounts.spotify.com/en/authorize?client_id=351cbabf37f84280ad75451c114a4765&redirect_uri=http://127.0.0.1:3000&response_type=token&scope=user-top-read";


// ========= API SONG DATA RETRIEVAL ==============

// request data about a song
async function getSongFeatures(id, token){
  let response = await axios.get("https://api.spotify.com/v1/audio-features/" + id, 
      {
        headers: {
            Accept: "application/json", 
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        }
      }
    )
  return (response.data)
}

// create a list of each song's mood/tempo data
async function getTopSongsAndFeatures(token) {

  let response = await axios.get("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=15&offset=0", 
    {
      headers: {
          Accept: "application/json", 
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
      }
    }
  )
  let FeatureArray = []
  for await(let x of response.data.items){
    let songFeatures = await getSongFeatures(x.id, token);
    //console.log(songFeatures)
    /*FeatureArray.push([{id: x.id,
      name: x.name,
      tempo: songFeatures["tempo"],
      energy: songFeatures["energy"]}])*/
      FeatureArray.push([x.name, songFeatures["tempo"], songFeatures["energy"]]);
  }
  return FeatureArray
}

// request user's top songs, return data on their songs in array
function SongCard({token}) {
  const [songData, setData] = useState(null);

  useEffect( ()=>{
    async function fetchData(){
      let TopSongsAndfeatures = await getTopSongsAndFeatures(token)
      setData(TopSongsAndfeatures)
    }
    fetchData()
  }
  ,[] )

  return (
    <SongGarden characteristics = {songData}/>
  );
}


// ============ BUILD FLOWERS ================

function drawFlower() {
  //
}

// construct flowers out of song data
function SongGarden({characteristics}) {
  //var characteristics = [{"name":"The Stream","tempo":123.987,"energy":0.486},{"name":"Silverhair Express","tempo":79.96,"energy":0.358},{"name":"Gurumi 구르미","tempo":95.049,"energy":0.723},{"name":"So Beautiful","tempo":122.021,"energy":0.719},{"name":"Hey Sun","tempo":114.982,"energy":0.34}];
  
  var listItems = [];
  if (characteristics != null){
    for (var i = 0; i < characteristics.length; i++){ 
      var tempo = characteristics[i][1];
      var energy = characteristics[i][2];
      var color = "blue";
      var size = "1";
      var pos = (120*i).toString();
      if (energy <= .5){
        color = "red";
      }

      if (tempo < 80){
        color = "rgb(.625(tempo), 0, 0)";
      }
      else if (tempo < 90){
        color = "rgb(16.6(tempo-80)+51, 0, 0)";
      }
      else if (tempo < 100){
        color = 16.6(tempo-90)+217;
        if (color > 255) {
          color = "rgb(0, color - 255, 0)";
        }
        else {
          color = "rgb(color, 0, 0)";
        }
      }
      else if (tempo < 110){
        color = 16.6(tempo-100)+384;
        if (color > 510) {
          color = "rgb(0, 0, color - 255)";
        }
        else {
          color = "rgb(0, color, 0)";
        }
      }
      else if (tempo < 120){
        color = "rgb(0, 0, 16.6(tempo-110)+550)";
      }
      else {
        color = "rgb(765)";
      }

      
      listItems.push(<Flower key={i} style = {{backgroundColor: color}} position = {{left: pos+"px", transform: "scale(" + size + ")"}}> </Flower>);
    }
  }

  return (
    <div className="wrapper">
        {listItems}
    </div>
  );
}


// ======== SITE NAVIGATION =========

function StartPage({token, setToken}) {
  //var characteristics = [{"name":"The Stream","tempo":123.987,"energy":0.486},{"name":"Silverhair Express","tempo":79.96,"energy":0.358},{"name":"Gurumi 구르미","tempo":95.049,"energy":0.723},{"name":"So Beautiful","tempo":122.021,"energy":0.719},{"name":"Hey Sun","tempo":114.982,"energy":0.34}];
  
  const history = useHistory();
  if(window.location.hash){
    const hash = window.location.hash
    .substring(1)
    .split('&')
    .reduce(function (initial, item) {
      if (item) {
        var parts = item.split('=');
        initial[parts[0]] = decodeURIComponent(parts[1]);
      }
      return initial;
    }, {});
    window.location.hash = ''; 
    setToken(hash.access_token);
    history.push("/garden");
  }

  return (
    
        <Card>
            <h1><b> Welcome! </b></h1>
            <a href={authorizationURL}> Click to Begin </a>
            
        </Card>
      
  );
}


function App() {
  const [token, setToken] = useState(null);

  return (
    <div className="app flex-center fill-view">
      <Router>
        <Switch>
          <Route exact path={"/"}> 
            <StartPage token={token} setToken={setToken}></StartPage> 
          </Route>
          <Route exact path={"/garden"}> 
            <SongCard token = {token}> </SongCard>
          </Route>          
          
          {/* </Switch><Flower position={{left: "100px"}} style={{backgroundColor: "red"}}/> */}
          {/* //</Router><Flower position={{left: "300px"}} style={{backgroundColor: "green"}}/> */}
          {/* //<Flower position={{left: "500px"}} style={{backgroundColor: "blue"}}/> */}
          
        </Switch>
      </Router>
    </div>
  );
}

export default App;