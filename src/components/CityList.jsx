import CityItem from './CityItem';
import styles from './CityList.module.css'
import Spinner from "./Spinner";
import Message from "./Message";
import { useCities } from "../context/CityContext";

function CityList() {
  const { cities, isLoading } = useCities();

  if (isLoading) return <Spinner />;
  if (!cities.length) return <Message message="add a city" />;
  
  return (
    <ul className={styles.cityList}>
      {cities.map(city => <CityItem key={city.id} city={city} />)}
    </ul>
  )
}

export default CityList
