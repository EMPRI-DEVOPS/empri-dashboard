from django.urls import path
from django.urls import include, path

from . import views

app_name = 'accounts'
urlpatterns = [
    path('', views.index, name='index'),
    path('index/', views.UserAccountsListView.as_view(), name='user-accounts'),
    path('new', views.CreateUserAccountView.as_view(), name='new-account'),
    path('<int:pk>/', views.UpdateUserAccountView.as_view(), name='account-detail'),
    path('<int:pk>/delete', views.DeleteUserAccountView.as_view(), name='account-delete'),
    path('<int:pk>/taiga_auth', views.taiga_auth, name='taiga-auth')
]
