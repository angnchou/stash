import React from 'react';
import ListItem from './ListItem.jsx';

const List = props => (
  <div id="list">
    <h4> List Component </h4>
    There are {props.items.length} bookmarks.
    {props.items.map((item, index) => (
      <ListItem key={index} item={item} />
    ))}
  </div>
);

export default List;
