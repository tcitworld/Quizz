let React = require('react');
let animateCss = require('animate.css-js');
const ReactDOM = require('react-dom');
const $ = require('jquery');


const Answer = function(props) {
    return (
      <li className="answer">{props.item}</li>
    );
}

class AnswerList extends React.Component {
  render() {

    const answerItems = [this.props.first, this.props.second, this.props.third, this.props.fourth];
    let answerNodes = answerItems.map(function(item, index) {
      if (typeof item !== "undefined") {
        return (<Answer key={index} item={item} />);
      }
    });

    return (
      <ul className="answerList">
        {answerNodes}
      </ul>
    );
  }
}

class Question extends React.Component {
  state = {
    data: [],
  }
  componentDidMount() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  }

  render() {
    return (
      <div className="question">
        <h2 className="questionTitle">
          {this.state.data.title}
        </h2>
        <AnswerList first={this.state.data.firstAlternative} second={this.state.data.secondAlternative} third={this.state.data.thirdAlternative} fourth={this.state.data.fourthAlternative} />
        <span className="answer hidden">
          {this.state.data.answer}
        </span>
      </div>
    );
  }
}

class QuestionList extends React.Component {
  render() {
    let questionNodes = this.props.data.map(function(question, index) {
      return (
        <Question url={question} key={index} />
      );
    });
    return (
      <div className="quizzList">
        {questionNodes}
      </div>
    );
  }
}

// tutorial2.js
class QuizzList extends React.Component {
  render() {
    let quizzNodes = this.props.data.map(function(quizz) {
      return (
        <Quizz name={quizz.name} key={quizz.id} id={quizz.id} questions={quizz.questions} />
      );
    });
    return (
      <div className="quizzList">
        {quizzNodes}
      </div>
    );
  }
}

class Quizz extends React.Component {
  handleQuizzClick(e) {
    console.log(e.target);
    e.target.style.transform = "translateX(-20em)";
    e.target.style.transition = "transform 2s;";
    console.log($(e.target).siblings(".zoneQuestions"));
    let zq = $(e.target).siblings(".zoneQuestions").eq(0);
    zq.show();
    zq.find('.question:not(:first-child)').hide();
  }

  render() {
    return (
      <div className="quizz">
        <h2 className="quizzName" onClick={this.handleQuizzClick} >
          {this.props.name}
        </h2>
        <div className="zoneQuestions">
          <QuestionList data={this.props.questions} />
        </div>
      </div>
    );
  }
}

class QuizzBox extends React.Component {
  state = {
    data: [],
  }
  componentDidMount() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data.quizz});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  }

  render() {
    return (
      <div className="quizzBox">
        <h1>Liste des Quizz</h1>
        <QuizzList data={this.state.data} />
      </div>
    );
  }
}

ReactDOM.render(
  <QuizzBox url="http://localhost:5000/api/quizz" />,
  document.getElementById('exemple')
);
