import React from 'react';
const ActionBar = props => {
  return (
    <div>
      <div>
        <button onClick={props.saveOrUpdate}>
          {props.selectedId ? 'Edit' : 'Save'}
        </button>
      </div>
      <div>
        <button onClick={props.handleDelete}>Delete</button>
      </div>
    </div>
  );
};

export default ActionBar;
