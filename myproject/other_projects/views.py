from django.shortcuts import render
from django.http import HttpResponse

from .models import Project

# Create your views here.
def IndexView(request):
	return render(request, 'other_projects/index.html', {"project_list": Project.objects.all()})
	
def DownloadView(request, project_id):
	project = Project.objects.get(id=project_id)
	socket = open(project.project_path, 'r')
	response = HttpResponse(socket, content_type='application/force-download')
	response['Content-Disposition'] = "attachement; filename=%s" %(project.project_path.split("/")[-1])
	return response
