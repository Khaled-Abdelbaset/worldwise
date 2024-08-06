import { useAuth } from "../context/FakeAuthContext";
import styles from "./User.module.css";

function User() {
  
  const {user, logout} = useAuth();

  function handleLogout() {
    logout();
  }

  return (
    <div className={styles.user}>
      <img src={user.avatar} alt={user.name} />
      <span>Welcome, {user.name}</span>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default User;
