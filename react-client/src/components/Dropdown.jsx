import React from 'react';

export default function Dropdown(props) {
  const groupedByCategory = _.groupBy(props.items, 'category');
  return (
    <div id="dropdown">
      <select value={props.currentCategory} onChange={props.selectCategory}>
        <option>Show All</option>
        {Object.keys(groupedByCategory).map(cat => (
          <option value={cat} key={cat}>
            {cat || 'Uncategorized'}
          </option>
        ))}
      </select>
    </div>
  );
}
