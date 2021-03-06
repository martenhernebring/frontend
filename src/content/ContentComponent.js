import React from 'react';
import SubmitComponent from './submit/SubmitComponent';
import './ContentComponent.css';
import ShowComponent from './show/ShowComponent';
import UploadComponent from './upload/UploadComponent'
import LoadComponent from './load/LoadComponent';
import { Component } from 'react';
import axios from "axios";
import Environment from '../environment/Environment'
import { Header } from "../model/Header";
import { Article } from '../model/Article';

class ContentComponent extends Component {

  constructor(props) {
    super(props)

    this.state = {
      formatted: '',
      headline: '',
      leader: '',
      support: '',
      category: 'INRIKES',
      pubYear: 2022,
      vignette: 'politik',
      articleId: 9839,
      oldArticleId: 9839,
      oldVignette: 'politik',
      images: [],
    }
  }

  loadImages() {
    fetch(Environment.IMAGES)
    .then(response => response.json())
    .then(images => this.setState({images}))
    .catch(error => console.log(error))
  }

  async componentDidUpdate() {
    if(this.state.articleId > 0 && this.state.images.length === 0) {
      this.loadImages()
    }
  }

  handleChange = (e) => {
    this.setState({[e.target.name]: e.target.value})
  }

  handleLoad = (e) => {
    e.preventDefault();
    this.setState({oldArticleId: this.state.articleId})
    this.setState({oldVignette: this.state.vignette})
    const {category, pubYear, vignette, articleId} = this.state
    const article = Environment.ARTICLES + '/' + category + '/' + pubYear + '/' + vignette + '/' + articleId
    axios.get(article)
    .then(r => {
      this.setState({
        formatted: new Article(
            r.data.headline,
            r.data.leader,
            r.data.support
          )
      })
      this.setState({images: []});
    }).catch(function (error) {
      if (error.response) {
        console.log(error)
        alert('Bad article: ' + error.response.data.message);
      } else if (error.request) {
        alert('No response: ' + error.request);
      } else {
        alert('Error during setup: ', error.message);
      }
    })
  }

  handleSubmit = (e) => {
    if (this.state.oldArticleId === this.state.articleId & this.state.oldVignette === this.state.vignette)
      this.handleOld()
    else
      this.handleNew(e)
  }

  handleOld() {
    console.log('old')
    const {headline, leader, support, category, pubYear, vignette, articleId} = this.state
    const endpoint = Environment.ARTICLES + '/' + category + '/' +
      pubYear + '/' + vignette + '/' + articleId
    axios.put(endpoint, new Article(headline, leader, support))
  }

  handleNew(e) {
    console.log('new')
    e.preventDefault()
    this.setState({oldArticleId: this.state.articleId})
    this.setState({oldVignette: this.state.vignette})
    const {headline, leader, support, category, pubYear, vignette, articleId} = this.state
    const draft = {header: new Header(category, pubYear, vignette, articleId),
      headline: headline, leader: leader, support: support}
    axios.post(Environment.ARTICLES, draft)
    .then(r => {
      this.setState({category: r.data.header.category})
      this.setState({pubYear: r.data.header.pubYear})
      this.setState({vignette: r.data.header.vignette})
      this.setState({articleId: r.data.header.articleId})
      this.setState({
        formatted: new Article(
            r.data.headline,
            r.data.leader,
            r.data.support
          )
      })
      this.setState({images: []});
    }).catch(function (error) {
      if (error.response) {
        console.log(error)
        alert('Bad article: ' + error.response.data.message);
      } else if (error.request) {
        alert('No response: ' + error.request);
      } else {
        alert('Error during setup: ', error.message);
      }
    })
  }

  handleUpload = (file) => {
    const formData = new FormData()
    formData.append("file", file)
    const {category, pubYear, vignette, articleId} = this.state
    const endpoint = Environment.IMAGES + '/' + category + '/' +
      pubYear + '/' + vignette + '/' + articleId;
    axios.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data"}})
        .then((response) => { console.log(response) })
        .catch(function (error) {
      if (error.response) {
        console.log(error)
        alert('Bad file: ' + error.response.data.message);
      } else if (error.request) {
        alert('No response: ' + error.request);
      } else {
        alert('Error during setup: ', error.message);
      }
    })
    this.loadImages()
  }

  render() {
    const {handleChange, handleLoad, handleSubmit, state, handleUpload} = this
    const {headline, leader, support, formatted, category, pubYear, vignette, articleId, oldArticleId, oldVignette, images} = state
    const isOld = articleId > -1 & articleId === oldArticleId & vignette === oldVignette
    return (
    <div className="row">
      <div className="left column">
        <LoadComponent
          category={category}
          pubYear={pubYear}
          vignette={vignette}
          articleId={articleId}
          onChange={handleChange}
          onLoad={handleLoad}
        />
        <UploadComponent
          isOld={isOld}
          onUpload={handleUpload}
        />
        <SubmitComponent
          headline={headline}
          leader={leader}
          support={support}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isOld={isOld}
        />
      </div>
      <div className="right column">
        <ShowComponent
          formatted={formatted}
          vignette={vignette}
          image={images.length ? images.reduce((p, c) => (p.time > c.time ? p : c)) : null}
          isOld={isOld}
        />
      </div>
    </div>
    )
  }
}

export default ContentComponent;
