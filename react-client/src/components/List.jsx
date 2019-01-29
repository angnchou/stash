import _ from 'lodash';
import React from 'react';
import Category from './Category.jsx';

const comparator = (c1, c2) => {
  if (!c1) {
    return 1;
  } else if (!c2) {
    return -1;
  } else {
    return c1.localeCompare(c2);
  }
};

const List = props => {
  const groupedByCategory = _.groupBy(props.items, 'category');
  return (
    <div id="list">
      {/* <h4>Bookmarks</h4> */}
      {/* There are {props.items.length} bookmarks. */}
      {Object.keys(groupedByCategory)
        .sort(comparator)
        .map(category => (
          <Category
            key={category}
            name={category}
            items={groupedByCategory[category]}
            handleEdit={props.handleEdit}
          />
        ))}
    </div>
  );
};

export default List;
