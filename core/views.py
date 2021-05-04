from django.views.generic.base import TemplateView
from django.views.generic.edit import CreateView
from django.contrib.auth import authenticate, login, update_session_auth_hash
from django.urls import reverse_lazy
from rest_framework.generics import UpdateAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializers import ChangePasswordSerializer, UserSerializer
from .forms import UserCreationForm


class IndexTemplateView(TemplateView):
    template_name = "base-vue.html"


class SignUpView(CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy('entry-point')
    template_name = 'registration/signup.html'

    def form_valid(self, form):
        valid = super().form_valid(form)
        username, password = form.cleaned_data.get(
            'username'), form.cleaned_data.get('password1')
        new_user = authenticate(username=username, password=password)
        login(self.request, new_user)
        return valid


class ChangePasswordView(UpdateAPIView):
    serializer_class = ChangePasswordSerializer

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        update_session_auth_hash(request, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserDetails(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
