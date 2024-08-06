import styles from "./Button.module.css";

function BackButton({ children, onClick }) {
  return (
    <button className={`${styles.btn} ${styles.back}`} onClick={onClick}>
      {children}
    </button>
  );
}

export default BackButton;
