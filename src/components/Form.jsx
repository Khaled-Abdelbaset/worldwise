import { useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";

import useUrlPosition from "../hooks/useUrlPosition";
import { useCities } from "../context/CityContext";
import { convertToEmoji, formatDate } from "../helpers/utils";

import Button from "./Button";
import Message from "./Message";
import Spinner from "./Spinner";

import styles from "./Form.module.css";
import "react-datepicker/dist/react-datepicker.css";

const BASE_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

const initialstate = {
  cityName: "",
  country: "",
  emoji: "",
  date: formatDate(new Date()),
  notes: "",
  isLoadingGeo: false,
  geoError: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return {
        ...state,
        isLoadingGeo: true,
        geoError: "",
      };
    case "selectedCity/loaded":
      return {
        ...state,
        isLoadingGeo: false,
        cityName: action.payload.city || action.payload.locality,
        country: action.payload.countryName,
        emoji: convertToEmoji(action.payload.countryCode),
      };
    case "newCity/date":
      return {
        ...state,
        date: formatDate(action.payload),
      };
    case "newCity/cityName":
      return {
        ...state,
        cityName: action.payload,
      };
    case "newCity/notes":
      return {
        ...state,
        notes: action.payload,
      };
    case "rejected":
      return {
        ...state,
        isLoadingGeo: false,
        geoError: action.payload,
      };
  }
}

function Form() {
  const [lat, lng] = useUrlPosition();
  const { createCity, isLoading } = useCities();
  const navigate = useNavigate();

  const [
    { cityName, country, emoji, date, notes, isLoadingGeo, geoError },
    dispatch,
  ] = useReducer(reducer, initialstate);

  useEffect(() => {
    if (!lat && !lng) return;
    async function fetchCityData() {
      try {
        dispatch({ type: "loading" });
        const res = await fetch(`${BASE_URL}?latitude=${lat}&longitude=${lng}`);
        const data = await res.json();

        if (!data.countryCode) {
          throw new Error(
            "No Data for Selected Loaction, Click on Other Loaction!"
          );
        }
        dispatch({ type: "selectedCity/loaded", payload: data });
      } catch (err) {
        dispatch({ type: "rejected", payload: err.message });
      }
    }
    fetchCityData();
  }, [lat, lng]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cityName || !date) return;
    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    };
    await createCity(newCity);
    navigate(`/app`);
  }

  if (!lat && !lng)
    return <Message message={"Click on any loaction on the map"} />;
  if (isLoadingGeo) return <Spinner />;
  if (geoError) return <Message message={geoError} />;

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ""}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) =>
            dispatch({ type: "newCity/cityName", payload: e.target.value })
          }
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <DatePicker
          id="date"
          selected={date}
          onChange={(date) => dispatch({ type: "newCity/date", payload: date })}
          dateFormat={"dd/MM/yyyy"}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => {
            dispatch({ type: "newCity/notes", payload: e.target.value });
          }}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <Button
          type="back"
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          &larr; Back
        </Button>
      </div>
    </form>
  );
}

export default Form;
