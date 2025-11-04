import { Card } from 'react-bootstrap';
import './SortOptions.css';

const SortOptions = ({ sortType, onSortChange, sortData = {} }) => {
  return (
    <div className="sort-options-wrapper my-5">
      {['best', 'cheapest', 'fastest'].map((type) => (
        <div
          key={type}
          className={`sort-card ${sortType === type ? 'active' : ''}`}
          onClick={() => onSortChange(type)}
        >
          <div className="sort-card-title">{type}</div>
          <div className="sort-card-price">{sortData[type]?.price ?? '—'} USD</div>
          <div className="sort-card-duration">
            Duration: {sortData[type]?.duration ?? '—'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SortOptions;
