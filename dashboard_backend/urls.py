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
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import RedirectView
from django.contrib.auth.forms import UserCreationForm
from rest_framework import routers

from accounts.views import SignUpView
from accounts.views import AccountViewSet
from accounts.views import github_auth
from core.views import IndexTemplateView

router = routers.DefaultRouter()
router.register(r'account', AccountViewSet, basename='account')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('github-auth', github_auth),
    path('auth/', include('django.contrib.auth.urls')),
    path('auth/signup', SignUpView.as_view(), name='signup'),
    path('s_accounts/', include('accounts.urls')),
    re_path(r"^.*$", IndexTemplateView.as_view(), name="entry-point"),
    #path('', RedirectView.as_view(url='accounts/')),
]

# Use static() to add url mapping to serve static files during development (only)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)