let React = require('react');
let ReactCSSTransitionGroup = require('react-addons-css-transition-group');
const ReactDOM = require('react-dom');
let $ = require('jquery');
let toastr = require('toastr');
let socketio = require('socket.io-client');
let socket = socketio.connect('http://' + document.domain + ':' + location.port + '/socket');

socket.emit("infogroom",{"data":42});

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

let setInfoWaitingUsers = (function(msg) {
    let executed = false;
    return function (msg) {
        if (!executed) {
            executed = true;
            toastr.info(msg);
        }
    };
})();

let setInfoEndGame = (function(msg) {
    let executed = false;
    return function (msg) {
        if (!executed) {
            executed = true;
            toastr.info(msg);
        }
    };
})();

class Quizz extends React.Component {

  constructor(props) {
    super(props);
    this.state = { 
      questionIndex: 0,
      quizzIndex: 0,
      questions: this.props.questions[0],
      score: 0,
      ended: false, };
    this._infoWaitingUsers = 0;
    this.answerClick = this.answerClick.bind(this);
    this.handleQuizzClick = this.handleQuizzClick.bind(this);
    this.nextQuestion = this.nextQuestion.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.reinit = this.reinit.bind(this);
  }

  componentDidMount(){
    
    socket.on("attente",function(msg){
        console.log("En attente d'un autre joueur");
        console.log(msg);
        setInfoWaitingUsers("En attente d'un autre joueur");
    }.bind(this));

    socket.on("score",function(msg){
      console.log(msg);
      let score;
      for (var i = 0; i < Object.keys(msg.score).length; i++) {
        score = Object.keys(msg.score)[0] + " : " +  msg.score[Object.keys(msg.score)[0]][0] + " et " + Object.keys(msg.score)[1] + " : " +  msg.score[Object.keys(msg.score)[1]][1];
      }
      console.log("Score de l'autre joueur : ");
      console.log(score);
      setInfoEndGame("Score : " + score);
    });

    socket.on("start",function(msg){
      this.setState({quizzIndex: msg.room});
      this.props.changeTitle(this.props.name);
      $('.quizz').eq(msg.room).find(".zoneQuestions").show();
    }.bind(this));

    socket.on("continuer",function(msg){
      $('.btnNext').css('display','block');
    });
  }

  answerClick(key, answer, questionId) {
    $(".quizz").eq(this.state.quizzIndex).find(".question").eq(0).find(".answer").eq(answer - 1).css('background-color','green');
    $(".quizz").eq(this.state.quizzIndex).find(".question").eq(0).find(".answer").not(":eq(" + (answer - 1) + ")").css('background-color','red');
    
    if (key == answer - 1) {
      this.setState({score: this.state.score+1});
    }
    
    socket.emit("testreponse",{"room":this.state.quizzIndex});

  }

  nextQuestion(questionId) {
    if (this.state.questionIndex+1 < this.props.questions.length) {
      this.setState({questionIndex: this.state.questionIndex+1});
      this.setState({questions: this.props.questions[this.state.questionIndex+1] });
    } else {
      this.setState({ended:true});
      socket.emit("finish",{"score":this.state.score,'room':this.state.quizzIndex})
    }
    $('.btnNext').hide();
  }
    

  handleQuizzClick(e) {
    $('.quizzName').not($('.quizzName').eq($('.quizz').index($(e.target).parent()))).hide();
    socket.emit("join", {"room":$('.quizz').index($(e.target).parent())});
  }

  reinit(){
    console.log("Reinitialisation");
    socket.emit("leave",{"room":this.state.quizzIndex});
    this.setState({ended:true});
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
        <button onClick={this.reinit} className="btn btn-primary" >Retour au lobby</button>
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

socket.on("infogroom",function(msg){
  // Ici afficher sur la page d'acceuilllllleeee :)
})
