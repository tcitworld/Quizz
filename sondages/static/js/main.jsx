let React = require('react');
let ReactCSSTransitionGroup = require('react-addons-css-transition-group');
const ReactDOM = require('react-dom');
let $ = require('jquery');
let socketio = require('socket.io-client');
let socket = socketio.connect('http://' + document.domain + ':' + location.port + '/socket');

class Question extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    }
    this.nextQuestion = this.nextQuestion.bind(this);
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

  onClickHandler(index, answer, questionId) {
    this.props.answerClick(index, answer, questionId);
  }

  nextQuestion() {
    this.props.nextQuestion(this.props.questionId);
  }

  render() {

    const answerItems = [this.state.data.firstAlternative, this.state.data.secondAlternative, this.state.data.thirdAlternative, this.state.data.fourthAlternative];
    let self = this;
    let answerNodes = answerItems.map(function(item, index) {
      if (typeof item !== "undefined") {
        return (<div key={index} className="col-md-6"><div className="answer" onClick={() => self.onClickHandler(index,self.state.data.answer, self.props.questionId)} key={index}>{item}</div></div>);
      }
    });

    return (
      <div className="question">
        <h2 className="questionTitle">
          {this.state.data.title}
        </h2>
        {answerNodes}
        <div><button className="btn btn-default btnNext center-block" onClick={this.nextQuestion}>Next</button></div>
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
      ended: false,
      username: "" };
    this.answerClick = this.answerClick.bind(this);
    this.handleQuizzClick = this.handleQuizzClick.bind(this);
    this.nextQuestion = this.nextQuestion.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount(){
    
    socket.on("new_player", function(msg) {
      console.log("New player connected: "+msg.username);
      if (this.state.username == "") {
        this.state.username = msg.username;
      }
      else {
        if (this.state.username != msg.username) {
          console.log("ready");
          socket.emit("readyC", {"mine": this.state.username, "theirs": msg.username, "room": msg.room});
        }
      }
    }.bind(this));

    socket.on("readyS", function(msg) {
      console.log(msg);
      console.log("serveur prêt");
      this.setState({quizzIndex: msg.room});
      this.props.changeTitle(this.props.name);
      $('.quizz').eq(msg.room).find('.zoneQuestions').show();
      $('.quizzName:not(:eq(' + msg.room + '))').hide();
    }.bind(this));

    // socket.on("battle",function(msg){
    //   console.log(msg);
    //   socket.emit('prepareBattle',{"username":msg.username,"room":msg.room});
    // });

    // socket.on("start",function(msg){
    //   console.log(msg);
    //   this.setState({quizzIndex: msg.room});
    //   this.props.changeTitle(this.props.name); 
    // }.bind(this));
  }

  answerClick(key, answer, questionId) {
    $(".quizz").eq(this.state.quizzIndex).find(".question").eq(0).find(".answer").eq(answer - 1).css('background-color','green');
    $(".quizz").eq(this.state.quizzIndex).find(".question").eq(0).find(".answer").not(":eq(" + (answer - 1) + ")").css('background-color','red');
    
    if (key == answer - 1) {
      this.setState({score: this.state.score+1});
    }
    $('.btnNext').css('display','block');

  }

  nextQuestion(questionId) {
    if (this.state.questionIndex+1 < this.props.questions.length) {
      this.setState({questionIndex: this.state.questionIndex+1});
      this.setState({questions: this.props.questions[this.state.questionIndex+1] });
    } else {
      this.setState({ended:true});
      socket.emit("finish",{"score":this.state.score})
    }
    $('.btnNext').hide();
  }
    
    // e.target.style.transform = "translateX(-20em)";
    // e.target.style.transition = "transform 2s;";
    // $(e.target).siblings(".zoneQuestions").eq(0).show();
    // $('.quizzName').not($(e.target).parent()).hide();

  handleQuizzClick(e) {
    socket.emit("join", {"room":$('.quizz').index($(e.target).parent())});
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
              <Question url={this.state.questions} answerClick={this.answerClick} questionId={this.state.questionIndex} key={this.state.questionIndex} nextQuestion={this.nextQuestion} />
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



