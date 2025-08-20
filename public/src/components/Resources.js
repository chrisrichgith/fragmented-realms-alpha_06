function Resources({ resources }) {
  return (
    <div className="resources-container">
      <div className="resource">
        <img src="/images/Chat/gold.png" alt="Gold" className="resource-icon" />
        <span>{resources.gold || 0}</span>
      </div>
      <div className="resource">
        <img src="/images/Chat/holz.png" alt="Holz" className="resource-icon" />
        <span>{resources.holz || 0}</span>
      </div>
      <div className="resource">
        <img src="/images/Chat/erz.png" alt="Erz" className="resource-icon" />
        <span>{resources.erz || 0}</span>
      </div>
      <div className="resource">
        <img src="/images/Chat/kristall.png" alt="Kristall" className="resource-icon" />
        <span>{resources.kristall || 0}</span>
      </div>
    </div>
  );
}
