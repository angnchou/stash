import React from 'react';
import Modal from 'react-modal';
import ActionBar from './ActionBar.jsx';
// import modal from '../../Dist/modal.css';

Modal.setAppElement(document.getElementById('app'));

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    text: 'Helvetica',
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
      <img
        onClick={props.closeModal}
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAMFBMVEX///9AQEAyMjJ5eXl1dXV6eno9PT12dnbj4+MwMDDg4ODk5OQ4ODhycnIsLCwpKSlUcLT7AAAD5klEQVR4nO2c25aCMAxFsTp4Zfz/vx0jOoo20ELSJqyzX+ehnrVLw7QNTQMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEjmtJIx+MGvnfoY3bVixNOxDdoRu9Aeq0W8BdxslCN2YbOpFvEe8BZxpzjGLtAQlSKefu8BVS12oR+i/a0Q8WFQ1eIuPIeoYPHfoKLFLryGKG7xzaCaxV14H6KwxYFBJYtdGA5R1OKHQRWLu/A5REGLkYDiET8NFo0YDSgcMRawWMTTNRpQNOL3FH1ELPOOumWGl1tu4gZphK3QCBPwEWUscgaLBdS2WN0goWnRgEFCz6IJg8SPkkXe4I/QL09GZ6IamaI9GhYNGSTkLZoySEgvN2YWmReyFs0ZJCQtGjRIyFk0aZCQsmjUICFTNIyViSESE9XsFO1ZbtG0QWKpReMGiWXLjeFF5sUSiw4MEvMtujBIzLXoxCCxn2WRN7gv9suTmVM0zJeJIfkT1dEU7cm16MwgwT+LsYh8QIPP4JOcouGmTAxJfxbdPYNPUi06NUikWXRrkEgp/a4K/TfTFl0bJKaKhssyMWTconuDBG9xP/o3R7AWL+1lBQYJNiKHt4DZEf0FzIzoMeDIchMJ6GqReZFs0adBItGiV4NEkkW/BokEi54NEpMWfRskJiL6DzgRcQ0BbxG5N9HbW+oqAjbNiMPaP02G1TscLRjeSwUxURH9R5ws+d4jsnsybxE1+xfVWf17aYJB3xZX//9hokG/FjM2MXyuqFkBPUbMDOgvIhvwsmH3vF1FHLtlodVtUxT+7Gk7+VcXTB2fafcvqsMfnz0vAvET1YXFlANQ1xanDRK8RfMrKh9wOAF5i8YjphkknFpMNUi4tJh3ndLhcpNjkHBX+vPvyTizmGuQcPUszrtO6cji3DvbborG/LtqTibqklv3Liwuu23owOLSO9vml5vl90WNW5S4da//YaYFyNz4NWxRqm/CrEW55iyjm4ySl9JNrqiy7XUGLUq3FZizKN+cZWy50WgMMWVRp73OkEWt1h4zFvUaJOf19Yuj2YVtomjodp8ZmKjaffTVLeo3SOb19YtzYL8jLLdTzU3U9noQG2OEQ4h/C1pyKz4esQ1FAjbNORZR+KwhFrENZ9ExRohYFD9M+Y5YzCBx/vxoucJmw+dy0x6LGSQ+LKochw0tFjVIHN4tKm0XvVtsj4UDDiyqHWi+LBY3SPxbVNzwe1qsYJB4FA3VI+neYsEyMeQ+UZXP3ClilSnac7OofqlgG6oZJA5X/VsT2zLvohwlBq8aEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAb/wBo5ojQXD5ye4AAAAASUVORK5CYII="
        id="close"
      />
      <ActionBar
        saveOrUpdate={props.saveOrUpdate}
        selectedId={props.selectedId}
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

      <form className="form">
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
        {/* <button type="button" onClick={props.handleAdd}>
          Add!
        </button> */}
      </form>
    </Modal>
  );
};

export default BookmarkModal;
