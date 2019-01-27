import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import List from './components/List.jsx';
import BookmarkModal from './components/bookmarkModal.jsx';

const axios = require('axios');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      modalIsOpen: false,
      title: '',
      category: '',
      url: '',
      notes: '',
      tags: '',
      selected: null,
    };
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
  }

  componentDidMount() {
    $.ajax({
      url: '/items',
      success: data => {
        this.setState({
          items: data,
        });
      },
      error: err => {
        console.log('err', err);
      },
    });
  }
  openModal() {
    this.setState({ modalIsOpen: true });
  }

  afterOpenModal() {
    this.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  handleChange(event) {
    this.setState({
      [event.target.id]: event.target.value,
    });
  }

  handleAdd(event) {
    event.preventDefault();
    $.ajax({
      method: 'POST',
      url: '/items',
      data: {
        title: this.state.title,
        category: this.state.category,
        url: this.state.url,
        notes: this.state.note,
        tags: this.state.tags,
      },
      success: data => {
        this.setState({
          items: data,
          title: '',
          category: '',
          url: '',
          notes: '',
          tags: '',
        });
      },
    });
    this.closeModal();
  }

  //change status to either delete or edit
  //delete is done in the back end
  handleSelect(bookmark) {
    this.setState({
      selected: bookmark,
    });
  }

  handleDelete(bookmark) {
    $.ajax({
      method: 'DELETE',
      url: '/items/delete/' + `${bookmark.id}`,
      success: data => {
        this.setState({
          items: data,
        });
      },
    });
  }

  handleEdit(bookmark) {
    this.setState({
      title: bookmark.title,
      category: bookmark.category,
      url: bookmark.url,
      notes: bookmark.notes,
      tags: bookmark.tags,
    });
    $.ajax({
      method: 'PATCH',
      url: '/items/edit/' + `${bookmark.id}`,
      data: BookmarkModal,
      success: (err, data) => {
        this.setState({
          items: data,
        });
      },
    });
  }

  render() {
    return (
      <div>
        {/* <div onClick={this.renderAdd} id="add">
          Add Bookmark:
          {this.state.renderAdd ? (
            <div id="modalBackground">
              {' '}
              <AddBookmark
                title={this.state.title}
                category={this.state.category}
                url={this.state.url}
                tags={this.state.tags}
                notes={this.state.notes}
                handleAdd={this.handleAdd}
                handleChange={this.handleChange}
              />{' '}
            </div>
          ) : null} */}
        {/* </div> */}
        <button onClick={this.openModal}>Open Modal</button>
        <div>
          {this.state.selected === null ? null : (
            <BookmarkModal
              modalIsOpen={this.state.modalIsOpen}
              onAfterOpen={this.afterOpenModal}
              closeModal={this.closeModal}
              handleAdd={this.handleAdd}
              selected={this.state.selected}
              handleDelete={this.handleDelete}
              handleEdit={this.handleEdit}
            />
          )}
        </div>

        <h1>Item List</h1>

        <List
          openModal={this.openModal}
          handleSelect={this.handleSelect}
          items={this.state.items}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
