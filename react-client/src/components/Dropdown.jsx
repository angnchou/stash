import React from 'react';

// import ListItem from './ListItem.jsx';

export default function Dropdown(props) {
  const groupedByCategory = _.groupBy(props.items, 'category');
  return (
    <div id="dropdown">
      <select>
        {Object.keys(groupedByCategory).map((cat, category) => (
          <option key={category} onClick={() => renderCategory(cat)}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}
