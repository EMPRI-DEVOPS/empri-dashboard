from django.urls import path
from django.urls import include, path

from . import views

app_name = 'assessment'
urlpatterns = [
    path('', views.index, name='index'),
    path('accounts/', views.UserAccountsListView.as_view(), name='user-accounts'),
    path('accounts/new', views.CreateUserAccountView.as_view(), name='new-account'),
    path('accounts/<int:pk>/', views.UpdateUserAccountView.as_view(), name='account-detail'),
    path('accounts/<int:pk>/delete', views.DeleteUserAccountView.as_view(), name='account-delete')
]
