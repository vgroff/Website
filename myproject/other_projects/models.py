from __future__ import unicode_literals

from django.db import models

# Create your models here.
class Project(models.Model):
	project_name = models.CharField(max_length=200)
	project_path = models.CharField(max_length=200)
	
	def __str__(self):
		return self.project_name
