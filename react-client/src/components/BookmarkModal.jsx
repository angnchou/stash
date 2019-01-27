import React from 'react';
import Modal from 'react-modal';
import ActionBar from './ActionBar.jsx';

Modal.setAppElement(document.getElementById('app'));

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};
const BookmarkModal = props => {
  return (
    <Modal
      isOpen={props.modalIsOpen}
      onAfterOpen={props.afterOpenModal}
      closeModal={props.closeModal}
      style={customStyles}
    >
      {/* <h2 ref={subtitle => (this.subtitle = subtitle)}>Hello</h2> */}
      <button onClick={props.closeModal}>close</button>
      <div>I am a modal</div>
      <ActionBar
        selected={props.selected}
        handleDelete={props.handleDelete}
        handleEdit={props.handleEdit}
      />
      {/* <form>
        <input />
        <button>tab navigation</button>
        <button>stays</button>
        <button>inside</button>
        <button>the modal</button>
      </form> */}

      <form>
        <label htmlFor="category">Add Category</label>
        <input
          type="text"
          id="category"
          onChange={props.handleChange}
          value={props.category}
        />
        <label htmlFor="title">Add Title</label>
        <input
          type="text"
          id="title"
          onChange={props.handleChange}
          value={props.title}
        />
        <label htmlFor="url">Add Url</label>
        <input
          type="text"
          id="url"
          onChange={props.handleChange}
          value={props.url}
        />
        <label htmlFor="notes">Add Notes</label>
        <input
          type="text"
          id="notes"
          onChange={props.handleChange}
          value={props.notes}
        />
        <label htmlFor="tags">Add Tags</label>
        <input
          type="text"
          id="tags"
          onChange={props.handleChange}
          value={props.tags}
        />
        <button type="button" onClick={props.handleAdd}>
          Add!
        </button>
      </form>
    </Modal>
  );
};

export default BookmarkModal;
