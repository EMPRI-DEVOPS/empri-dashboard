from django.conf import settings
from django.views.generic.base import TemplateView


class IndexTemplateView(TemplateView):
    template_name = "index.html"
