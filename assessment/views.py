from django.shortcuts import render
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.views.generic.list import ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy

from .models import Account
from .forms import AccountForm


def index(request):
    return render(request, 'assessment/index.html')


class UserAccountsListView(LoginRequiredMixin, ListView):
    model = Account

    def get_queryset(self):
        return Account.objects.filter(user=self.request.user)


class CreateUserAccountView(LoginRequiredMixin, CreateView):
    model = Account
    fields = ['tool']
    success_url = reverse_lazy('assessment:user-accounts')

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)


class UpdateUserAccountView(LoginRequiredMixin, UpdateView):
    model = Account
    fields = ['tool', 'enabled']
    success_url = reverse_lazy('assessment:user-accounts')


class DeleteUserAccountView(LoginRequiredMixin, DeleteView):
    model = Account
    success_url = reverse_lazy('assessment:user-accounts')
