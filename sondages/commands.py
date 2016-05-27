from .app import manager, db
from .models import Sondage, Question, SimpleQuestion

@manager.command
def loaddb(filename):
	'''
	Cree les tables et les remplit avec 
	les données du fichier json
	'''

	# Création de toutes les tables
	db.create_all()

	import json
	with open(filename) as json_file:
		sondage = json.load(json_file)

	# Import des modèles
    # Et création du sondage au nom du user toto
	sond = Sondage(name=sondage['name'],username="toto")
	db.session.add(sond)
	db.session.commit()

	for q in sondage["questions"]:
		oq = SimpleQuestion(title=q["title"],
			firstAlternative=q["firstAlternative"],
			secondAlternative=q["secondAlternative"],
			sondage_id=sond.id)
		db.session.add(oq)
	db.session.commit()

	
