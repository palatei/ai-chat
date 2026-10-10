import { BackgroundScene3D } from './components/BackgroundScene3D/BackgroundScene3D.jsx';
import { ChatWidget } from './components/ChatWidget/ChatWidget.jsx';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.shell}>
      <BackgroundScene3D />
      <div className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.badge}>Демо сайта</p>
          <h1 className={styles.title}>Интернет-магазин с поддержкой 24/7</h1>
          <p className={styles.subtitle}>
            Плавающий виджет в углу — как у Jivo. Откройте чат справа внизу, попробуйте быстрые
            ответы и переключение темы в шапке окна.
          </p>
          <ul className={styles.features}>
            <li>История диалога с мок-данными</li>
            <li>Индикатор «печатает…» и ответы по ключевым фразам</li>
            <li>Светлая / тёмная тема</li>
          </ul>
        </header>

        <main className={styles.mockContent} aria-hidden>
          <div className={styles.cardGrid}>
            {[1, 2, 3].map((n) => (
              <article key={n} className={styles.card}>
                <div className={styles.cardImage} />
                <div className={styles.cardLine} />
                <div className={styles.cardLineShort} />
              </article>
            ))}
          </div>
        </main>

        <ChatWidget />
      </div>
    </div>
  );
}
