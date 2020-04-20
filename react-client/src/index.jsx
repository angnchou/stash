import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import List from './components/List.jsx';
import BookmarkModal from './components/BookmarkModal.jsx';
import Dropdown from './components/Dropdown.jsx';

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
      currentCategory: 'Show All',
      shareModalIsOpen: false,
      sharedWithEmail: ''
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
    this.selectCategory = this.selectCategory.bind(this);
    this.logOut = this.logOut.bind(this);
    this.handleShare = this.handleShare(this);
  }

  logOut() {
    window.location = '/logout'
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

  selectCategory(event) {
    this.setState({
      currentCategory: event.target.value,
    });
  }

  saveOrUpdate() {
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
        },
      });
    }
  }

  handleShare(email, bookmark) {
    this.setState({
      sharedWithEmail: email,
      url: bookmark.url
    })
  }

  render() {
    return (
      <div>
        <div id="header">
          <img
            id="plus"
            src="https://png.pngtree.com/svg/20170315/plus_grey_880693.png"
            onClick={this.openModal}
          />
          <svg onClick={this.logOut}
            xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" style={{ shapeRendering: 'geometricprecision' }}><path fillRule="evenodd" fill="currentColor" d="M12 7V5.99c0-.539.34-.698.76-.339l1.98 1.7c.424.363.42.942 0 1.301l-1.98 1.697c-.424.364-.76.207-.76-.34V9H6a1 1 0 1 1 0-2h6zm-3.491 6A.49.49 0 0 0 9 12.505v-1.506A.997.997 0 0 1 10 10c.552 0 1 .444 1 1v1.995A1.997 1.997 0 0 1 9 15H3c-1.105 0-2-.897-2-2.006V3.006C1 1.898 1.887 1 3 1h6a2 2 0 0 1 2 2.005V5c0 .552-.444 1-1 1-.552 0-1-.443-1-.999V3.495A.498.498 0 0 0 8.509 3H3.491A.5.5 0 0 0 3 3.51v8.98c0 .282.228.51.491.51h5.018z"></path></svg>
        </div>
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
        <div><h1>Stash</h1><div></div></div>
        <Dropdown
          items={this.state.items}
          currentCat={this.state.currentCategory}
          selectCategory={this.selectCategory}
        />
        <List
          items={this.state.items}
          handleEdit={this.handleEdit}
          currentCategory={this.state.currentCategory}
          handleShare={this.handleShare}
        />

      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
