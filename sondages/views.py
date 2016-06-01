from .app import app, db
from flask import render_template, request, jsonify, abort,url_for,redirect
from .models import Question, Sondage, SimpleQuestion,User
from flask.ext.wtf import Form,RecaptchaField
from wtforms import StringField, HiddenField,PasswordField,SelectField,TextAreaField,validators
from flask.ext.login import login_user,current_user,logout_user,login_required
from wtforms.validators import DataRequired
from sqlalchemy.exc import IntegrityError
from hashlib import sha256


#~ ============================================================Formulaires pour la connexion====================================================
class SigninForm(Form):
	username=StringField('Username',validators=[DataRequired()])
	password=PasswordField('Password',validators=[DataRequired()])
	next=HiddenField()

class LoginForm(Form):
	username=StringField('Username',validators=[DataRequired()])
	password=PasswordField('Password',validators=[DataRequired()])
	next=HiddenField()
	
	def get_authenticated_user(self):
		user=User.query.get(self.username.data)
		if user is None:
			return None
		m=sha256()
		m.update(self.password.data.encode())
		passwd=m.hexdigest()
		return user if passwd==user.password else None

@app.route("/")
def home():
	f=LoginForm()
	return render_template(
		"sondages.html",
		title="Questions",form=f)

#Recupérer les quizz
@app.route('/api/quizz', methods=['GET'])
def get_sondages():
	username=current_user.username
	sondages = Sondage.query.filter(Sondage.username==username).all()
	return jsonify({'quizz': [ s.to_json() for s in sondages ]})

#Lecture d'un sondage pour un id
@app.route('/api/quizz/<int:id>', methods=['GET'])
def get_sondage(id):
    sondage = Sondage.query.get_or_404(id)
    return jsonify(sondage.to_json())
    
@app.route('/api/quizz/<int:id>/questions', methods=['GET'])
def get_sondageQuestions(id):
	quests = SimpleQuestion.query.filter(SimpleQuestion.sondage_id==id).all()
	return jsonify({'questions': [ q.to_json() for q in quests ]})

#route de lecture des questions
@app.route('/api/questions', methods=['GET'])
def get_questions():
    quests = SimpleQuestion.query.all()
    return jsonify({'questions': [ q.to_json() for q in quests ]})

#lecture d'une question
@app.route('/api/questions/<int:id>', methods=['GET'])
def get_question(id):
    question = SimpleQuestion.query.get_or_404(id)
    return jsonify(question.to_json())


#route d'envoi d'une question au serveur
@app.route('/api/questions', methods=['POST'])
def create_question():
	quests = SimpleQuestion.query.all()
	if not request.json or not 'title' in request.json:
		abort(400)
	question = SimpleQuestion(
		title = request.json['title'],
		firstAlternative = request.json.get('firstAlternative', ""),
		secondAlternative = request.json.get('secondAlternative', ""),
		thirdAlternative = request.json.get('thirdAlternative', ""),
		fourthAlternative = request.json.get('fourthAlternative', ""),
		answer = request.json.get('answer', 0),
		sondage_id = request.json['sondage_id']
	)
	db.session.add(question)
	db.session.commit()
	print(question.to_json())
	return jsonify(question.to_json()), 201

#~ route pour editer une question
@app.route('/api/questions/<int:id>', methods=['PUT'])
def edit_question(id):
    question = SimpleQuestion.query.get_or_404(id)
    question.sondage_id = request.json['sondage_id']
    question.title = request.json.get('title',"")
    question.firstAlternative = request.json.get('firstAlternative',"")
    question.secondAlternative = request.json.get('secondAlternative',"")
    question.thirdAlternative = request.json.get('thirdAlternative', ""),
    question.fourthAlternative = request.json.get('fourthAlternative', ""),
    question.answer = request.json.get('answer', 0),
    db.session.commit()
    return jsonify(question.to_json())

#~route pour supprimer une question 
@app.route('/api/questions/<int:id>', methods=['DELETE'])
def delete_question(id):
	questions = SimpleQuestion.query.all()
	question = list(filter(lambda t : t.id == id, questions))
	if len(question)==0:
		abort(404)
	db.session.delete(question[0])
	db.session.commit()
	return jsonify({'result': True})

#~route pour crée un sondage
@app.route('/api/quizz', methods=['POST'])
def create_sondage():
	if not request.json or not 'name' in request.json:
		abort(400)
	username=current_user.username
	sondage = Sondage(name=request.json['name'],username=username)
	db.session.add(sondage)
	db.session.commit()
	return jsonify(sondage.to_json()), 201
	
	
#~ route pour supprimer un sondage	
@app.route('/api/quizz/<int:id>', methods=['DELETE'])
def delete_sondage(id):
	sondages = Sondage.query.all()
	sond = list(filter(lambda t : t.id == id, sondages))
	if len(sond)==0:
		abort(404)
	db.session.delete(sond[0])
	db.session.commit()
	return jsonify({'result': True})

#~ route pour l'inscription
@app.route("/signin",methods=("GET","POST",))
def signin():
	f=SigninForm()
	if not f.is_submitted():
		f.next.data=request.args.get("next")
	elif f.validate_on_submit():
		try:
			m=sha256()
			m.update(f.password.data.encode())
			u=User(username=f.username.data,password=m.hexdigest())
			db.session.add(u)
			db.session.commit()
			next=f.next.data or url_for('home')
			login_user(u)
		except IntegrityError:
			return render_template("signin.html",form=f,LoginUtil=True)
		return redirect(next)
	return render_template("signin.html",form=f,LoginUtil=False)
		
		
#~ route pour la connexion		
@app.route("/login",methods=("GET","POST",))
def login():
	f=LoginForm()
	if not f.is_submitted():
		f.next.data=request.args.get("next")
	elif f.validate_on_submit():
		user=f.get_authenticated_user()
		if user:
			login_user(user)
			next=url_for('home')
			return redirect(next)
	return render_template("sondages.html",form=f,ChampVide=ChampVide)


#~route pour la deconnexion 
@app.route("/logout/")
def logout():
	logout_user()
	return redirect(url_for('home'))
