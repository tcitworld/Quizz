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
    username = db.Column(db.String(50), db.ForeignKey("user.username"))
    user = db.relationship("User",
    backref=db.backref("sondages", lazy="dynamic",
        cascade="all, delete-orphan"))

    def __init__(self, name,username):
        self.name = name
        self.username=username

    def __repr__(self):
        return "<Sondage (%d) %s>" % (self.id, self.name)



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


@login_manager.user_loader
def load_user(username):
	return User.query.get(username)
