from django.contrib import admin

# Register your models here.

from .models import Choice, Question

# This makes it possible to add questions for the admin page, and to add choices while you do so!

class ChoiceInline(admin.TabularInline): # Otherwise to stacked inline
    model = Choice
    extra = 3

class QuestionAdmin(admin.ModelAdmin):
    fieldsets = [
        (None,               {'fields': ['question_text']}),
        ('Date information', {'fields': ['pub_date']}),
        ('User Edits',       {'fields': ['can_add_new_choice']}),
    ]
    inlines = [ChoiceInline]
    list_display = ('question_text', 'pub_date', 'was_published_recently', 'can_add_new_choice') #  What shows in the list of questions
    list_filter = ['pub_date'] # Ways to filter the list
    search_fields = ['question_text']	

admin.site.register(Question, QuestionAdmin)
