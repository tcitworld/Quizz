let React = require('react');
let ReactCSSTransitionGroup = require('react-addons-css-transition-group');
const ReactDOM = require('react-dom');
let $ = require('jquery');

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

  // componentWillReceiveProps() {
  //   $.ajax({
  //     url: this.props.url,
  //     dataType: 'json',
  //     cache: false,
  //     success: function(data) {
  //       this.setState({data: data});
  //     }.bind(this),
  //     error: function(xhr, status, err) {
  //       console.error(this.props.url, status, err.toString());
  //     }.bind(this),
  //   });
  // }

  onClickHandler(index, answer, questionId) {
    this.props.answerClick(index, answer, questionId);
  }

  render() {

    const answerItems = [this.state.data.firstAlternative, this.state.data.secondAlternative, this.state.data.thirdAlternative, this.state.data.fourthAlternative];
    let self = this;
    let answerNodes = answerItems.map(function(item, index) {
      if (typeof item !== "undefined") {
        return (<div key={index} className="col-md-4"><div className="answer" onClick={() => self.onClickHandler(index,self.state.data.answer, self.props.questionId)} key={index}>{item}</div></div>);
      }
    });

    return (
      <div className="question">
        <h2 className="questionTitle">
          {this.state.data.title}
        </h2>
        {answerNodes}
      </div>
    );
  }
}

class QuizzList extends React.Component {
  render() {
    let quizzNodes = this.props.data.map(function(quizz) {
      return (
        <Quizz name={quizz.name} key={quizz.id} id={quizz.id} questions={quizz.questions} changeTitle={this.props.changeTitle} />
      );
    }, this);
    return (
      <div className="quizzList">
        {quizzNodes}
      </div>
    );
  }
}

class Quizz extends React.Component {

  constructor(props) {
    super(props);
    this.state = { 
      questionIndex: 0,
      quizzIndex: 0,
      questions: this.props.questions[0],
      score: 0,
      ended: false };
    this.answerClick = this.answerClick.bind(this);
    this.handleQuizzClick = this.handleQuizzClick.bind(this);
  }

  answerClick(key, answer, questionId) {
    $(".quizz").eq(this.state.quizzIndex).find(".question").eq(0).find(".answer").eq(answer - 1).css('background-color','green');
    $(".quizz").eq(this.state.quizzIndex).find(".question").eq(0).find(".answer").not(":eq(" + (answer - 1) + ")").css('background-color','red');
    
    if (key == answer - 1) {
      this.setState({score: this.state.score+1})
    }

    if (this.state.questionIndex+1 < this.props.questions.length) {
      this.setState({questionIndex: this.state.questionIndex+1});
      this.setState({questions: this.props.questions[this.state.questionIndex+1] })
    } else {
      this.setState({ended:true})
    }
  }

  handleQuizzClick(e) {
    this.setState({quizzIndex: $('.quizz').index($(e.target).parent())});
    this.props.changeTitle(this.props.name);
    e.target.style.transform = "translateX(-20em)";
    e.target.style.transition = "transform 2s;";
    $(e.target).siblings(".zoneQuestions").eq(0).show();
    $('.quizzName').not($(e.target).parent()).hide();
  }

  render() {

    let score = "";
    if (this.state.score > 0) {
        score = (<div className="score pull-right">
          {this.state.score}
        </div>);
    }
    let content;
    if (this.state.ended) {
      content = 
      (<div className="quizz">
        <div className="col-md-4 col-md-offset-4">Vous avez achevé le QCM. Votre score est de {this.state.score}</div>
        </div>);
    } else {
      content = (
      <div className="quizz">
        {score}
        <h2 className="quizzName" onClick={this.handleQuizzClick} >
          {this.props.name}
        </h2>
        <div className="zoneQuestions">
          <ReactCSSTransitionGroup transitionName="example" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
            <Question url={this.state.questions} answerClick={this.answerClick} questionId={this.state.questionIndex} key={this.state.questionIndex} />
          </ReactCSSTransitionGroup>
        </div>
      </div>
    );
    }
    return content;
  }
}

class QuizzBox extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      title: "Liste des Quizz",
    },
    this.changeTitle = this.changeTitle.bind(this);
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

  changeTitle(nTitle) {
    this.setState({title: nTitle});
  }

  render() {
    return (
      <div className="quizzBox">
        <h1>{this.state.title}</h1>
        <QuizzList data={this.state.data} changeTitle={() => this.changeTitle()} />
      </div>
    );
  }
}

ReactDOM.render(
  <QuizzBox url="http://localhost:5000/api/quizz" />,
  document.getElementById('exemple')
);
