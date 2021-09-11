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
import sky from "./images/sky.jpg";
import rain from "./images/rain.jpg";
import clouds from "./images/clouds.jpg";
import storm from "./images/storm.jpg";
import snow from "./images/snow.jpg";
import def from "./images/default.jpg";

require("dotenv").config();

function App() {
  const [temp, setTemp] = useState("15");
  const [location, setLocation] = useState("Budapest, Hungary");
  const [weather, setWeather] = useState("");
  const [img, setImg] = useState("");
  const [id, setId] = useState("800");
  const [fact, setFact] = useState("");
  const [latlon, setLatLon] = useState({ lat: "47.497913", lon: "19.040236" });
  const [forecast, setForecast] = useState([]);

  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ["(cities)"],
    },
    debounce: 300,
  });

  const getWeather = (val) => {
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${val}&lang=en&units=metric&appid=${process.env.REACT_APP_API_KEY}`
      )
      .then((response) => {
        let icon = response.data.weather[0].icon;

        setLatLon({
          lat: response.data.coord.lat,
          lon: response.data.coord.lon,
        });

        setWeather(response.data.weather[0].description);
        setId(String(response.data.weather[0].id));
        getIcon(icon);

        let getTemp = response.data.main.temp;
        let temperature = Math.round(getTemp);
        setTemp(temperature.toString());
        setLocation(val);
      })
      .catch((error) => {
        console.log(error);
        alert("Error in city name!");
      });
  };
  const getIcon = (icon) => {
    let imgUrl = `http://openweathermap.org/img/wn/${icon}.png`;
    setImg(imgUrl);
  };
  const getForecastIcon = (icon) => {
    let imgUrl = `http://openweathermap.org/img/wn/${icon}.png`;
    return imgUrl;
  };
  const dateFormat = (dt) => {
    const a = new Date(dt * 1000);
    const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dateFormat = weekday[a.getDay()];
    return dateFormat;
  };

  useEffect(() => {
    setValue("");
    getWeather(location);
  }, []);

  useEffect(() => {
    fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${latlon.lat}&lon=${latlon.lon}&units=metric&exclude=current,minutely,hourly,alerts&appid=${process.env.REACT_APP_API_KEY}`
    )
      .then((res) => res.json())
      .then((response) => {
        let list = response.daily.slice(1, 6);
        setForecast(
          list.map((df) => {
            return {
              date: dateFormat(df.dt),
              minTemp: Math.round(df.temp.min),
              maxTemp: Math.round(df.temp.max),
              weatherIcon: getForecastIcon(df.weather[0].icon),
              weatherDescription: df.weather[0].description,
            };
          })
        );
      })
      .catch((error) => console.log("error", error));
  }, [latlon]);

  useEffect(() => {
    axios.get(`http://numbersapi.com/${temp}/math`).then((response) => {
      setFact(response.data);
    });
  }, [temp]);

  const handleSearch = () => {
    setValue(value);
    getWeather(value);
    setValue("");
  };

  const handleInput = (e) => {
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
      }
    }

    const suggestions = cities.map(({ key, city, country }) => (
      <ComboboxOption key={key} value={city + ", " + country} />
    ));

    return <>{suggestions}</>;
  };
  function startsWith(str, word) {
    return str.lastIndexOf(word, 0) === 0;
  }

  return (
    <div
      className="App"
      style={
        id === "800"
          ? { backgroundImage: `url(${sky})`, backgroundPosition: "bottom" }
          : startsWith(id, "80")
          ? { backgroundImage: `url(${clouds})` }
          : startsWith(id, "3") || startsWith(id, "5")
          ? { backgroundImage: `url(${rain})` }
          : startsWith(id, "2")
          ? { backgroundImage: `url(${storm})` }
          : startsWith(id, "6")
          ? { backgroundImage: `url(${snow})` }
          : { backgroundImage: `url(${def})` }
      }
    >
      <div className="wrapper">
        <div className="container">
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
              <ComboboxList>
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
            <div className="location">
              <LocationOnIcon />
              <p className="location-text">{location}</p>
            </div>
          </div>
          <div className="weather-box">
            <div className="weather-description">
              <img src={img} alt="Weather icon" />
              <p className="weather-text">{weather}</p>
            </div>
            <div className="content">
              {Number(temp) <= 0
                ? "It's freezing"
                : Number(temp) >= 30
                ? "It's hot!"
                : Number(temp) < 15
                ? "It's quite cold"
                : "Well, It's pretty decent"}
            </div>
          </div>
        </div>
        <div className="forecast">
          {forecast.length !== 0
            ? forecast.map((i, index) => (
                <div className="forecast-card" key={index}>
                  <h5 className="weekday">{i.date}</h5>
                  <div className="forecast-weather">
                    <img src={i.weatherIcon} alt="weather icon" />
                    <p>{i.weatherDescription}</p>
                  </div>

                  <div className="forecast-temp">
                    {i.minTemp + "° / " + i.maxTemp + "°"}
                  </div>
                </div>
              ))
            : null}
        </div>

        <div className="facts">
          <h2>Did You Know?</h2>
          <div className="fact-box">
            <div>{fact}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
