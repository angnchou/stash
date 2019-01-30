import React from 'react';

const ListItem = props => {
  if (props.item.img) {
    window.img = props.item.img;
  }
  return (
    <div id="bookmark">
      <div id="bookmarkInner">
        <a href={props.item.url} target="_blank" title={props.item.url}>
          <img src={props.item.img} />
        </a>
        <div className="bookmarkDetails">
          <a href={props.item.url} target="_blank">
            <div title={props.item.url}>{props.item.title}</div>
          </a>
          <div>{props.item.notes}</div>
          <div className="tags" id="tags">
            {props.item.tags}
          </div>
          <img
            id="edit"
            src="https://image.flaticon.com/icons/png/512/23/23187.png"
            onClick={() => {
              console.log(props.item);
              props.handleEdit(props.item);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ListItem;
