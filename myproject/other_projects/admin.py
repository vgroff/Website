from django.contrib import admin

# Register your models here.

from .models import Project

# This makes it possible to add questions for the admin page, and to add choices while you do so!

class ProjectAdmin(admin.ModelAdmin):
    fieldsets = [
        (None,               {'fields': ['project_name']}),
        ('Path', {'fields': ['project_path']}),
    ]
    list_display = ('project_name', 'project_path') #  What shows in the list of questions
    search_fields = ['projectName']	

admin.site.register(Project, ProjectAdmin)
