from .app import db
from flask import url_for
from flask.ext.login import UserMixin
from .app import login_manager

class User(db.Model,UserMixin):
	username	=db.Column(db.String(50),primary_key=True)
	password	=db.Column(db.String(64))
	
	def get_id(self):
		return self.username

class Sondage(db.Model):
    id   = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

    def __init__(self, name):
        self.name = name
	
    def __repr__(self):
        return "<Sondage (%d) %s>" % (self.id, self.name)

    def to_json(self):
        json_sondage = {
            'url': url_for('get_sondage', 
                id=self.id, _external=True),
            'name': self.name,
            'questions': 
            [ q.to_json()['url'] for q in self.questions ],
            'id':self.id
        }
        return json_sondage

class Question(db.Model):
    id     = db.Column(db.Integer, 
        primary_key=True)
    title  = db.Column(db.String(120))
    sondage_id = db.Column(db.Integer, 
        db.ForeignKey('sondage.id'))
    sondage = db.relationship("Sondage",
        backref=db.backref("questions", 
        lazy="dynamic",
        cascade="all, delete-orphan"))

    def __repr__(self):
        return "<Question (%d) %s>" % (self.id, self.title)

    def to_json(self):
        json_quest = {
            'url': url_for('get_question',
             id=self.id, _external=True),
            'sondage_url': url_for('get_sondage'
                , id=self.sondage_id,
                 _external=True),
            'title': self.title,
            'question-type': self.__class__.__name__
            }
        return json_quest
        
 

class SimpleQuestion(Question):
    firstAlternative = db.Column(db.String(120))
    secondAlternative = db.Column(db.String(120))
    thirdAlternative = db.Column(db.String(120))
    fourthAlternative = db.Column(db.String(120))
    answer = db.Column(db.Integer)
    firstChecked = db.Column(db.Boolean)

    def to_json(self):
        json_quest = super(SimpleQuestion, self).to_json()
        json_quest['firstAlternative'] = self.firstAlternative
        json_quest['secondAlternative'] = self.secondAlternative
        if (self.thirdAlternative != ""):
            json_quest['thirdAlternative'] = self.thirdAlternative
            if (self.fourthAlternative != ""):
                json_quest['fourthAlternative'] = self.fourthAlternative
        json_quest['answer'] = self.answer
        return json_quest


@login_manager.user_loader
def load_user(username):
	return User.query.get(username)
