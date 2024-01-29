import uuid
from datetime import date

class Task:
	def __init__(self):
		self.id = uuid.uuid4()
		self.title = ""
		self.note = ""
		self.date = date.today()

	def set(self, title, note, date):
		self.title = title
		self.note = note
		self.date = date
