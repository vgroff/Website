from django.shortcuts import render

# Create your views here.
def IndexView(request):
	return render(request, 'to_do/index.html', {})

