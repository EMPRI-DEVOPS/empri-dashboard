"""account views"""
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import GithubAuthFlow
from .serializers import AccountSerializer, TaigaAuthSerializer


@login_required
def github_auth(request):
    state = request.GET['state']
    code = request.GET['code']
    github_auth = GithubAuthFlow.objects.get(state_parameter=state)
    try:
        github_auth.get_access_token(code)
    except Exception:
        pass
    return redirect('/accounts')


class AccountViewSet(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.accounts.order_by('id').all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(methods=['post'], detail=True)
    def taiga_auth(self, request, pk=None):
        serializer = TaigaAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        account_queryset = self.request.user.accounts.all()
        account = get_object_or_404(account_queryset, pk=pk)
        account.credentials = serializer.response
        account.username = serializer.response['username']
        account.instance_url = serializer.validated_data['url']
        account.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
