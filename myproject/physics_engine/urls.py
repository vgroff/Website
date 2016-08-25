from django.conf.urls import url

from . import views

app_name = 'physics_engine'

urlpatterns = [
    url(r'^$', views.IndexView, name="index"),
]
