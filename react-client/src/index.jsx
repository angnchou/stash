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
      selectedId: null,
    };
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.clearForm = this.clearForm.bind(this);
    this.saveOrUpdate = this.saveOrUpdate.bind(this);
  }

  clearForm() {
    this.setState({
      title: '',
      category: '',
      url: '',
      notes: '',
      tags: '',
      selectedId: null,
    });
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData() {
    $.get('/items')
      .then(data => {
        this.setState({
          items: data,
        });
      })
      .catch(err => {
        console.log('err', err);
      });
  }

  openModal() {
    this.setState({ modalIsOpen: true });
    this.clearForm();
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
    $.post('/items/api', {
      title: this.state.title,
      category: this.state.category,
      url: this.state.url,
      notes: this.state.note,
      tags: this.state.tags,
    }).then(data => {
      this.fetchData();
      this.closeModal();
      this.clearForm();
    });
  }

  //change status to either delete or edit
  //delete is done in the back end

  handleDelete() {
    $.ajax({
      method: 'DELETE',
      url: `/items/delete/${this.state.selectedId}`,
      success: data => {
        this.setState({
          items: data,
        });
        this.clearForm();
        this.closeModal();
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
      modalIsOpen: true,
      selectedId: bookmark.id,
    });
  }

  //need id otherwise every click adds to list
  saveOrUpdate() {
    console.log('SAVE OR UPDATE');
    if (!this.state.selectedId) {
      $.post('/items/api', {
        category: this.state.category,
        url: this.state.url,
        notes: this.state.notes,
        tags: this.state.tags,
        modalIsOpen: true,
      })
        .then(result => {
          this.fetchData();
          this.closeModal();
          this.clearForm();
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      $.ajax({
        method: 'PATCH',
        url: `/items/${this.state.selectedId}`,
        data: {
          title: this.state.title,
          category: this.state.category,
          url: this.state.url,
          notes: this.state.notes,
          tags: this.state.tags,
        },
        success: data => {
          this.fetchData();
          this.closeModal();
          this.clearForm();
        },
      });
    }
  }

  render() {
    return (
      <div>
        <button onClick={this.openModal}>Open Modal</button>
        <BookmarkModal
          saveOrUpdate={this.saveOrUpdate}
          handleChange={this.handleChange}
          modalIsOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          closeModal={this.closeModal}
          handleAdd={this.handleAdd}
          selectedId={this.state.selectedId}
          handleDelete={this.handleDelete}
          handleEdit={this.handleEdit}
          title={this.state.title}
          category={this.state.category}
          url={this.state.url}
          notes={this.state.notes}
          tags={this.state.tags}
        />
        <h2>Stash</h2>
        <List items={this.state.items} handleEdit={this.handleEdit} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
