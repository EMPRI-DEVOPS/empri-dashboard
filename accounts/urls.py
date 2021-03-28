from django.urls import path
from django.urls import include, path

from . import views

app_name = 's_accounts'
urlpatterns = [
    path('', views.index, name='dashboard'),
    path('json', views.accounts_json, name='json'),
    path('index/', views.UserAccountsListView.as_view(), name='index'),
    path('new', views.CreateUserAccountView.as_view(), name='new'),
    path('<int:pk>/', views.UpdateUserAccountView.as_view(), name='detail'),
    path('<int:pk>/delete', views.DeleteUserAccountView.as_view(), name='delete'),
    path('<int:pk>/delete-credentials', views.delete_credentials, name='delete-credentials'),
]
