import React from 'react';

const ListItem = props => (
  <div id="bookmark">
    <div>{props.item.category}</div>

    <div>{props.item.title}</div>

    <div>{props.item.url}</div>

    <div>{props.item.notes}</div>

    <div>{props.item.tags}</div>
  </div>
);

export default ListItem;
