import StatCard from "./StatCard";

const StatsGrid = ({ stats }: any) => (
    <div className="stats-grid">
        {stats.map((item: any, index: number) => (
            <StatCard key={index} title={item.title} value={item.value} />
        ))}
    </div>
);

export default StatsGrid;
