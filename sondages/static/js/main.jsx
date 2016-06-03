var React = require('react');
var ReactDOM = require('react-dom');
var marked = require('marked');
var $ = jQuery = require('jquery');

var AnswerList = React.createClass({
  render: function() {
    return (
      <ul className="answerList">
        <li class="answer">{this.props.first}</li>
        <li class="answer">{this.props.second}</li>
        <li class="answer">{this.props.third}</li>
        <li class="answer">{this.props.fourth}</li>
      </ul>
    );
  }
});

var Question = React.createClass({

  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log(data);
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    return (
      <div className="question">
        <h2 className="questionTitle">
          {this.state.data.title}
        </h2>
        <AnswerList first={this.state.data.firstAlternative} second={this.state.data.secondAlternative} third={this.state.data.thirdAlternative} fourth={this.state.data.fourthAlternative} />
        <span class="answer">
          {this.state.data.answer}
        </span>
      </div>
    );
  }
});

var QuestionList = React.createClass({

  render: function() {
    var questionNodes = this.props.data.map(function(question) {
      return (
        <Question url={question}>
        </Question>
      );
    });
    return (
      <div className="quizzList">
        {questionNodes}
      </div>
    );
  }
});

// tutorial2.js
var QuizzList = React.createClass({
  render: function() {
    var quizzNodes = this.props.data.map(function(quizz) {
      return (
        <Quizz name={quizz.name} key={quizz.id} id={quizz.id} questions={quizz.questions} >
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
        <h2 className="quizzName">
          {this.props.name}
        </h2>
        <span class="quizzId">
          {this.props.id}
        </span>
        <div class="zoneQuestions">
          <QuestionList data={this.props.questions} />
        </div>
      </div>
    );
  }
});


// tutorial9.js
var QuizzBox = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data.quizz});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    return (
      <div className="quizzBox">
        <h1>Quizz</h1>
        <QuizzList data={this.state.data} />
      </div>
    );
  }
});

ReactDOM.render(
      <QuizzBox url="http://localhost:5000/api/quizz" />,
      document.getElementById('exemple')
);