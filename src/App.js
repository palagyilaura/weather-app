import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import usePlacesAutocomplete from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import SearchIcon from "@material-ui/icons/Search";
import sun from "./images/sun.jpg"
import rain from "./images/rain.jpg"
import clouds from "./images/clouds.jpg"
import storm from "./images/storm.jpg"
import snow from "./images/snow.jpg"


require("dotenv").config();

function App() {
  const [temp, setTemp] = useState("");
  const [location, setLocation] = useState("Budapest, Hungary");
  const [weather, setWeather] = useState("");
  const [img, setImg] = useState("");

  //const [input, setInput] = useState("");

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue
  } = usePlacesAutocomplete({
    requestOptions: {
      /* Define search scope here */
      types: ['(cities)']
    },
    debounce: 300,
  });

  const getWeather = (val) => {
    //console.log(val);
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${val}&lang=en&units=metric&appid=${process.env.REACT_APP_API_KEY}`
      )
      .then((response) => {
        //console.log(response.data);
        let icon = response.data.weather[0].icon;

        setWeather(response.data.weather[0].description);

        let imgUrl = `http://openweathermap.org/img/wn/${icon}.png`;
        setImg(imgUrl);

        //console.log(imgUrl);
        let getTemp = response.data.main.temp;
        let temperature = Math.round(getTemp);
        setTemp(temperature.toString());
        setLocation(val);
      })
      .catch((error) => {
        console.log(error);
        //setLocation("");
        alert("Error in city name!");
      });
  };

  useEffect(() => {
    setValue("");
    //setValue(location);
    getWeather(location);
  }, []);

  const handleSearch = () => {
    setValue(value);
    //console.log(value);
    getWeather(value);

    setValue("");
  };
  //console.log(weather);
  const handleInput = (e) => {
    // Update the keyword of the input element
    setValue(e.target.value);
  };


  const handleSelect = (val) => {
    setValue(val, false);
  };

  const renderSuggestions = () => {
    let cities = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i]["types"].includes("locality")) {
        cities.push({
          key: data[i]["place_id"],
          city: data[i]["structured_formatting"]["main_text"],
          country: data[i]["structured_formatting"]["secondary_text"],
        });
        //console.log(data[i]);
      }
    }
    //console.log("data: ", data);
    const suggestions = cities.map(({ key, city, country }) => (
      <ComboboxOption key={key} value={city + ", " + country} />
    ));

    //console.log(suggestions);
    return <>{suggestions}</>;
  };

  return (
    <div className="App" style={{ backgroundImage: weather === "clear sky" ? `url(${sun})` : weather === "few clouds" || weather === "scattered clouds" || weather === "broken clouds" ? `url(${clouds})` : weather === "rain" || weather === "shower rain" ? `url(${rain})` : weather === "thunderstorm" ? `url(${storm})` : weather === "snow" ? `url(${snow})` : console.log("mist") }}>
      <div className="wrapper">
        <div className="container" >
          <Combobox onSelect={handleSelect} aria-labelledby="demo">
            <ComboboxInput
              className="input"
              type="text"
              style={{ width: 300, maxWidth: "90%" }}
              value={value}
              onChange={handleInput}
              disabled={!ready}
              placeholder="Type in city name"
            />
            <ComboboxPopover>
              <ComboboxList >
                {status === "OK" && renderSuggestions()}
              </ComboboxList>
            </ComboboxPopover>
          </Combobox>
          <button className="submit" onClick={handleSearch} value="submit">
            <SearchIcon />
          </button>
        </div>

        <div className="weather">
          <div className="temperature">
            <p className="temp-text">{temp}°</p>
            <div className="weather-box">
              <img src={img} alt="Weather icon" />
              <p className="weather-text">{weather}</p>
            </div>
          </div>
        </div>
        <div className="content">
          Well, <br /> it's pretty decent
        </div>

        <div className="location">
          <LocationOnIcon />
          <p className="location-text">{location}</p>
        </div>
      </div>

    </div>
  );
}

export default App;
