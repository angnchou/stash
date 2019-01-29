import React from 'react';

import ListItem from './ListItem.jsx';

export default function Category(props) {
  return (
    <div id="category">
      <h4>{props.name || 'Uncategorized'}</h4>
      {props.items.map(item => (
        <ListItem key={item.id} item={item} handleEdit={props.handleEdit} />
      ))}
    </div>
  );
}
