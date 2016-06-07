#! /usr/bin/env python3
from sondages import manager, socketio, app

if __name__ == '__main__':
	socketio.run(app)
