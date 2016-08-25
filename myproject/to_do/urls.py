from django.conf.urls import url

from . import views

app_name = 'to_do'

urlpatterns = [
    url(r'^$', views.IndexView, name="index"),
]
