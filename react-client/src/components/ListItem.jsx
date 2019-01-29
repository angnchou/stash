import React from 'react';

const ListItem = props => {
  if (props.item.img) {
    window.img = props.item.img;
  }
  return (
    <div
      id="bookmark"
      onClick={() => {
        console.log(props.item);
        props.handleEdit(props.item);
      }}
    >
      <img src={props.item.img} />
      <div>{props.item.title}</div>

      <div>{props.item.url}</div>

      <div>{props.item.notes}</div>

      <div>{props.item.tags}</div>
    </div>
  );
};

export default ListItem;
