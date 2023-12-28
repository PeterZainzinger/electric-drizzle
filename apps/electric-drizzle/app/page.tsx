import styles from './page.module.scss';
import MainScreen from '../_components/MainScreen';

export default async function Index() {
  return (
    <div className={styles.page}>
      <MainScreen />
    </div>
  );
}
