"""account views"""
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.views.generic.edit import CreateView
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import GithubAuthFlow
from .serializers import AccountSerializer, TaigaAuthSerializer


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

    @action(methods=['post'], detail=True)
    def taiga_auth(self, request, pk=None):
        serializer = TaigaAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        account_queryset = self.request.user.accounts.all()
        account = get_object_or_404(account_queryset, pk=pk)
        account.credentials = serializer.response
        account.save()
        return Response({'success': True})


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
