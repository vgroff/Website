# run these tests with (in my project virtual env(source bin/activate)) "python manage.py test appname" with appname here is polls 

import datetime

from django.test import TestCase

from django.utils import timezone

from django.core.urlresolvers import reverse

from .models import Question



class QuestionMethodTests(TestCase):

    def testWasPublishedRecentlyWithFutureQuestion(self):
        """
        test if was_published_recently returns false for questions published in the future
        """
        time = timezone.now() + datetime.timedelta(days=30)
        future_question = Question(pub_date=time)
        self.assertEqual(future_question.wasPublishedRecently(), False)

    def testWasPublishedRecentlyWithRecentQuestion(self):
        """
        test if was_published_recently returns false for questions published in the future
        """
        time = timezone.now() - datetime.timedelta(hours=3)
        future_question = Question(pub_date=time)
        self.assertEqual(future_question.wasPublishedRecently(), True)

    def testWasPublishedRecentlyWithOldQuestion(self):
        """
        test if was_published_recently returns false for questions published in the future
        """
        time = timezone.now() - datetime.timedelta(days=30)
        future_question = Question(pub_date=time)
        self.assertEqual(future_question.wasPublishedRecently(), False)



def create_question(question_text, days):
    time = timezone.now() + datetime.timedelta(days=days)
    return Question.objects.create(question_text=question_text, pub_date=time)

class QuestionViewTests(TestCase):

    def testIndexViewWithNoQuestions(self):
        response=self.client.get(reverse('polls:index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "No polls are available")
        self.assertQuerysetEqual(response.context["latest_question_list"], [])

    def testIndexViewWithAPastQuestion(self):
        create_question(question_text="Past question", days=-30)
        response = self.client.get(reverse('polls:index'))
        self.assertQuerysetEqual( response.context['latest_question_list'], ['<Question: Past question>'])    

    def testIndexWithAFutureQuestion(self):
        create_question(question_text="Future question", days=30)
        response = self.client.get(reverse('polls:index'))
        self.assertQuerysetEqual( response.context['latest_question_list'], [])         
       
    def testIndexViewWithTwoPastQuestions(self): 
        create_question(question_text="Past question", days=-20)
        create_question(question_text="Past question2", days=-30)
        response = self.client.get(reverse('polls:index'))
        self.assertQuerysetEqual( response.context['latest_question_list'], ['<Question: Past question>', '<Question: Past question2>']) 



