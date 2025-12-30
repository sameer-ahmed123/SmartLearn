import styles from './StatsCard.module.css';

interface StatsCardProps {
  title: string;
  value: number;
  icon: string; // Emoji or custom icon
  color?: string;
}

const StatsCard = ({ title, value, icon, color = '#3498db' }:StatsCardProps) => {
  return (
    <div className={styles.card} style={{ borderLeftColor: color }}>
      <div className={styles.iconWrapper} style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <h2 className={styles.value}>{value.toLocaleString()}</h2>
      </div>
    </div>
  );
};

export default StatsCard;