# run these tests with (in my project virtual env(source bin/activate)) "python manage.py test appname" with appname here is polls 

import datetime

from django.test import TestCase

from django.utils import timezone

from django.core.urlresolvers import reverse

from .models import Question



class QuestionMethodTests(TestCase):

    def testwas_published_recentlyWithFutureQuestion(self):
        """
        test if was_published_recently returns false for questions published in the future
        """
        time = timezone.now() + datetime.timedelta(days=30)
        future_question = Question(pub_date=time)
        self.assertEqual(future_question.was_published_recently(), False)

    def testwas_published_recentlyWithRecentQuestion(self):
        """
        test if was_published_recently returns false for questions published in the future
        """
        time = timezone.now() - datetime.timedelta(hours=3)
        future_question = Question(pub_date=time)
        self.assertEqual(future_question.was_published_recently(), True)

    def testwas_published_recentlyWithOldQuestion(self):
        """
        test if was_published_recently returns false for questions published in the future
        """
        time = timezone.now() - datetime.timedelta(days=30)
        future_question = Question(pub_date=time)
        self.assertEqual(future_question.was_published_recently(), False)



def create_question_with_choice(question_text, days):
    time = timezone.now() + datetime.timedelta(days=days)
    question = Question.objects.create(question_text=question_text, pub_date=time)
    question.choice_set.create(choice_text="default", votes=0)
    return question

class QuestionViewTests(TestCase):

    def testIndexViewWithNoQuestions(self):
        response=self.client.get(reverse('polls:index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No polls are available")
        self.assertQuerysetEqual(response.context["latest_question_list"], [])

    def testIndexViewWithAPastQuestion(self):
        create_question_with_choice(question_text="Past question", days=-30)
        response = self.client.get(reverse('polls:index'))
        self.assertQuerysetEqual( response.context['latest_question_list'], ['<Question: Past question>'])    

    def testIndexWithAFutureQuestion(self):
        create_question_with_choice(question_text="Future question", days=30)
        response = self.client.get(reverse('polls:index'))
        self.assertQuerysetEqual( response.context['latest_question_list'], [])         
        
    def testIndexViewWithAQuestionWithNoChoices(self):
		question = create_question_with_choice(question_text="Past question", days = -20)
		for choice in question.choice_set.all():
			choice.delete()
		response = self.client.get(reverse('polls:index'))
		self.assertQuerysetEqual( response.context['latest_question_list'], []) 

       
    def testIndexViewWithTwoPastQuestions(self): 
        create_question_with_choice(question_text="Past question", days=-20)
        create_question_with_choice(question_text="Past question2", days=-30)
        response = self.client.get(reverse('polls:index'))
        self.assertQuerysetEqual( response.context['latest_question_list'], ['<Question: Past question>', '<Question: Past question2>']) 
        


