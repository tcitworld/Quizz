var React = require('react');
var ReactDOM = require('react-dom');
var marked = require('marked');
var jQuery = require('jquery');

// tutorial2.js
var QuizzList = React.createClass({
  render: function() {
    var quizzNodes = this.props.data.map(function(quizz) {
      return (
        <Quizz name={quizz.author} key={quizz.id}>
          {quizz.text}
        </Quizz>
      );
    });
    return (
      <div className="quizzList">
        {quizzNodes}
      </div>
    );
  }
});


// tutorial4.js
var Quizz = React.createClass({
  render: function() {
    return (
      <div className="quizz">
        <h2 className="quizzAuthor">
          {this.props.author}
        </h2>
        {this.props.name}
      </div>
    );
  }
});


var data;
fetch('http://localhost:5000/api/quizz', {
  method: 'GET',
  mode: 'cors',
  credentials: 'include', 
  headers: new Headers({
    'Content-Type': 'application/json',
  })
}).then(function(resp) {
  return resp.json();
}).then(function(j) {
  console.log(j.quizz);
  render(j.quizz);
}).catch(function(err) {
  console.log(err);
});

// tutorial9.js
var QuizzBox = React.createClass({
  render: function() {
    return (
      <div className="quizzBox">
        <h1>Quizz</h1>
        <QuizzList data={this.props.data} />
      </div>
    );
  }
});

function render(data) {
  ReactDOM.render(
      <QuizzBox data={data} />,
      document.getElementById('exemple')
  );
}