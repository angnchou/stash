import React from 'react';
import Share from './Share.jsx';

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
          <div className="bookmarkToolbar">
            <img
              id="edit"
              src="https://image.flaticon.com/icons/png/512/23/23187.png"
              onClick={() => {
                props.handleEdit(props.item);
              }}
            />

            <img
              id="share"
              src="https://cdn0.iconfinder.com/data/icons/feather/96/591236-share-512.png"
              onClick={() => {
                console.log(props.item.url, 'URL')
                props.handleShare(props.item.url);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListItem;
