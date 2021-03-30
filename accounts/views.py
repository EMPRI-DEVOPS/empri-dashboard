from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.views.generic.list import ListView
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse, reverse_lazy
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.forms import UserCreationForm
from rest_framework import viewsets, permissions
from rest_framework.response import Response
import json

from .models import Account, GithubAuthFlow
from .forms import AccountForm, TaigaForm
from .serializers import AccountSerializer


def index(request):
    return render(request, 'accounts/index.html')

@login_required
def accounts_json(request):
    accounts = request.user.accounts.all()
    accounts_list = list(accounts)
    return JsonResponse(accounts_list, safe=False)

@login_required
def github_auth(request):
    state = request.GET['state']
    code = request.GET['code']
    github_auth = GithubAuthFlow.objects.get(state_parameter=state)
    github_auth.get_access_token(code)
    account = github_auth.account
    return redirect('/accounts/'+str(account.id))

class AccountViewSet(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    def get_queryset(self):
        return self.request.user.accounts.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    #def list(self, request):
    #    queryset = request.user.accounts.all()
    #    serializer = AccountSerializer(queryset, many=True)
    #    return Response(serializer.data)

    #def retrieve(self, request, pk=None):
    #    queryset = request.user.accounts.all()
    #    account = get_object_or_404(queryset, pk=pk)
    #    serializer = AccountSerializer(account)
    #    return Response(serializer.data)

class SignUpView(CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy('login')
    template_name = 'registration/signup.html'




@login_required
def delete_credentials(request, pk):
    queryset = request.user.accounts
    account = get_object_or_404(queryset, pk=pk)
    if request.method == 'POST':
        account.credentials = []
        account.save()
        return redirect('accounts:detail', pk=pk)
    return render(request, 'accounts/account_confirm_delete_credentials.html', {'account': account})