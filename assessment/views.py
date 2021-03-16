from django.shortcuts import render
from django.views.generic.edit import CreateView, UpdateView, DeleteView
from django.views.generic.list import ListView
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.http import HttpResponse

from .models import Account
from .forms import AccountForm, TaigaAuthForm


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

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        account = context["object"]
        if (account and account.tool == "Taiga"):
            context["taiga_auth_form"] = TaigaAuthForm()
        return context


class DeleteUserAccountView(LoginRequiredMixin, DeleteView):
    model = Account
    success_url = reverse_lazy('assessment:user-accounts')


@require_POST
@login_required
def taiga_auth(request, pk):
    password = request.POST['password']
    return HttpResponse(password)
