import React from 'react';
const ActionBar = props => {
  return (
    <div className="actionBar">
      <div>
        <button className="actionButtons" onClick={props.saveOrUpdate}>
          {props.selectedId ? 'Update' : 'Save'}
        </button>

        {/* <img
          src="http://www.stickpng.com/assets/images/585e4831cb11b227491c338e.png"
          onClick={props.saveOrUpdate}
        /> */}
      </div>
      <div>
        <button className="actionButtons" onClick={props.handleDelete}>
          Delete
        </button>
        {/* <img
          id="delete"
          src="https://images.vexels.com/media/users/3/132505/isolated/preview/fec64ffe207b10917bf22370bf606c11-flat-trash-can-icon-by-vexels.png"
          onClick={props.handleDelete}
        /> */}
      </div>
    </div>
  );
};

export default ActionBar;
