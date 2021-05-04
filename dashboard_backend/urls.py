"""dashboard_backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include, path, re_path
from rest_framework import routers
from django.conf import settings
from django.conf.urls.static import static

from accounts.views import AccountViewSet, github_auth
from core.views import IndexTemplateView, SignUpView, ChangePasswordView

router = routers.DefaultRouter(trailing_slash=False)
router.register(r'account', AccountViewSet, basename='account')

urlpatterns = [
    path('api/', include(router.urls)),
    path('github-auth', github_auth),
    path('auth/', include('django.contrib.auth.urls')),
    path('auth/signup', SignUpView.as_view(), name='signup'),
    path('auth/change_password', ChangePasswordView.as_view()),
    re_path(r"^.*$", IndexTemplateView.as_view(), name="entry-point"),
]

if (settings.DEBUG):
    urlpatterns += static(settings.STATIC_URL,
                          document_root=settings.STATIC_ROOT)
