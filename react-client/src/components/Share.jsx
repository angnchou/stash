import ShareModal from 'react-modal';
import React from 'react';


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

const Share = props => {
  console.log(props, 'PROPS')
  return (
    <ShareModal
      style={customStyles}
      isOpen={props.ModalIsOpen}
      onAfterOpen={props.AfterOpenModal}
      closeModal={props.CloseModal}
    >
      <form>
        <input type="text" id="email" value={props.email} />
        <input type="text" id="url" value={props.url} />
      </form>
    </ShareModal>
  )
}


export default Share;
