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

from .models import Account
from .forms import AccountForm, TaigaForm
from .serializers import AccountSerializer


def index(request):
    return render(request, 'accounts/index.html')

@login_required
def accounts_json(request):
    accounts = request.user.accounts.all()
    accounts_list = list(accounts)
    return JsonResponse(accounts_list, safe=False)

class AccountViewSet(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    def get_queryset(self):
        return self.request.user.accounts.all()
    
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


class UserAccountsListView(LoginRequiredMixin, ListView):
    model = Account

    def get_queryset(self):
        return self.request.user.accounts.all()


class CreateUserAccountView(LoginRequiredMixin, CreateView):
    model = Account
    fields = ['tool']

    def get_success_url(self):
        return reverse('accounts:detail', kwargs={'pk': self.object.pk})

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)


class UpdateUserAccountView(LoginRequiredMixin, UpdateView):
    model = Account
    fields = ['tool', 'enabled']
    #success_url = reverse_lazy('accounts:index')

    def get_form_class(self):
        if self.object.tool == "Taiga" and not self.object.credentials:
            return TaigaForm
        else:
            return AccountForm

    def form_valid(self, form):
        try:
            if form.response:
                account = self.object
                account.credentials = form.response
                account.save()
        except AttributeError:
            pass
        return super().form_valid(form)
        #return self.render_to_response(self.get_context_data(form=form))

    # def get_context_data(self, **kwargs):
    #    context = super().get_context_data(**kwargs)
    #    account = context["object"]
    #    if (account and account.tool == "Taiga"):
    #        context["taiga_auth_form"] = TaigaAuthForm()
    #    return context


class DeleteUserAccountView(LoginRequiredMixin, DeleteView):
    model = Account
    success_url = reverse_lazy('accounts:index')

@login_required
def delete_credentials(request, pk):
    queryset = request.user.accounts
    account = get_object_or_404(queryset, pk=pk)
    if request.method == 'POST':
        account.credentials = []
        account.save()
        return redirect('accounts:detail', pk=pk)
    return render(request, 'accounts/account_confirm_delete_credentials.html', {'account': account})