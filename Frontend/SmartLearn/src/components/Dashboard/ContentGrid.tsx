const ContentGrid = ({ left, right }: any) => (
    <div className="content-grid">
        <div className="card">{left}</div>
        <div className="card">{right}</div>
    </div>
);

export default ContentGrid;
