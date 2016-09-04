from django.conf.urls import url

from . import views

app_name = 'other_projects'

urlpatterns = [
    url(r'^$', views.IndexView, name="index"),
    url(r'download/(?P<project_id>[0-9]+)/$', views.DownloadView, name="download_project")
]
